import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import { Produit } from 'src/MARKET PLACE/produits/entities/produit.entity';
import { Demande } from 'src/MARKET PLACE/demandes/entities/demande.entity';
import { Marcher } from 'src/DECOUPAGE ADMINISTRATIF/marcher/entities/marcher.entity';
import { Localite } from 'src/DECOUPAGE ADMINISTRATIF/localite/entities/localite.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Produit) private produitRepo: Repository<Produit>,
    @InjectRepository(Demande) private demandeRepo: Repository<Demande>,
    @InjectRepository(Marcher) private marcherRepo: Repository<Marcher>,
    @InjectRepository(Localite) private localiteRepo: Repository<Localite>,
  ) {}

  async getDashboardStats() {
    const [users, produits, demandes, marchers, localites] = await Promise.all([
      this.userRepo.find({ select: ['id', 'nom', 'prenom', 'email', 'role', 'pays', 'createdAt'] }),
      this.produitRepo.find({
        relations: ['category', 'localite'],
        order: { createdAt: 'DESC' },
      }),
      this.demandeRepo.find({
        relations: ['produit', 'acheteur'],
        order: { createdAt: 'DESC' },
      }),
      this.marcherRepo.find({
        relations: { localite: { commune: { departement: { region: true } } } },
      }),
      this.localiteRepo.find({
        relations: { commune: { departement: { region: true } } },
      }),
    ]);

    // ── Counts ───────────────────────────────────────────────────────────────
    const counts = {
      users: users.length,
      produits: produits.length,
      demandes: demandes.length,
      marchers: marchers.length,
      localites: localites.length,
    };

    // ── Users by pays ─────────────────────────────────────────────────────────
    const countryMap: Record<string, number> = {};
    users.forEach((u) => {
      const pays = u.pays || 'Non défini';
      countryMap[pays] = (countryMap[pays] || 0) + 1;
    });
    const usersByPays = Object.entries(countryMap)
      .map(([pays, count]) => ({ pays, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // ── Products by category ──────────────────────────────────────────────────
    const catMap: Record<string, number> = {};
    produits.forEach((p) => {
      const cat = p.category?.nom || 'Autre';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });
    const produitsByCategory = Object.entries(catMap)
      .map(([category, count]) => ({ category, count }));

    // ── Top products by price ─────────────────────────────────────────────────
    const topProduits = produits
      .filter((p) => p.prix && Number(p.prix) > 0)
      .sort((a, b) => Number(b.prix) - Number(a.prix))
      .slice(0, 8)
      .map((p) => ({ id: p.id, nom: p.nom, prix: Number(p.prix), category: p.category?.nom }));

    // ── Demandes by month ─────────────────────────────────────────────────────
    const monthMap: Record<string, number> = {};
    demandes.forEach((d) => {
      if (d.createdAt) {
        const key = new Date(d.createdAt).toLocaleDateString('fr-FR', {
          month: 'short',
          year: '2-digit',
        });
        monthMap[key] = (monthMap[key] || 0) + 1;
      }
    });
    const demandesByMonth = Object.entries(monthMap)
      .map(([month, count]) => ({ month, count }))
      .slice(-6);

    // ── Localities with market count ──────────────────────────────────────────
    const localiteMarketsCount: Record<number, number> = {};
    marchers.forEach((m) => {
      const lid = m.localite?.id;
      if (lid) localiteMarketsCount[lid] = (localiteMarketsCount[lid] || 0) + 1;
    });

    const localitesWithStats = localites.map((loc) => ({
      id: loc.id,
      nom: loc.nom,
      commune: loc.commune?.nom || '–',
      departement: loc.commune?.departement?.nom || '–',
      region: loc.commune?.departement?.region?.nom || '–',
      marketsCount: localiteMarketsCount[loc.id] || 0,
    }));

    // ── Recent entries ────────────────────────────────────────────────────────
    const recentProduits = produits.slice(0, 5).map((p) => ({
      id: p.id,
      nom: p.nom,
      prix: p.prix,
      image: p.image,
      category: p.category?.nom,
      createdAt: p.createdAt,
    }));

    const recentDemandes = demandes.slice(0, 5).map((d) => ({
      id: d.id,
      quantite: d.quantite,
      montantTotal: d.montantTotal,
      statut: d.statut,
      produit: d.produit?.nom,
      acheteur: d.acheteur ? `${d.acheteur.nom} ${d.acheteur.prenom}` : '–',
      createdAt: d.createdAt,
    }));

    return {
      counts,
      usersByPays,
      produitsByCategory,
      topProduits,
      demandesByMonth,
      localites: localitesWithStats,
      recentProduits,
      recentDemandes,
    };
  }

  async getGlobalCounts() {
    const [users, produits, demandes, marchers] = await Promise.all([
      this.userRepo.count(),
      this.produitRepo.count(),
      this.demandeRepo.count(),
      this.marcherRepo.count(),
    ]);
    return { users, produits, demandes, marchers };
  }

  async getSellerDashboard(sellerId: number) {
    const [produits, demandes] = await Promise.all([
      this.produitRepo.find({
        where: { user: { id: sellerId } },
        relations: ['category', 'demandes'],
        order: { createdAt: 'DESC' },
      }),
      this.demandeRepo
        .createQueryBuilder('d')
        .leftJoinAndSelect('d.produit', 'p')
        .leftJoinAndSelect('p.user', 'u')
        .leftJoinAndSelect('d.acheteur', 'a')
        .where('u.id = :sellerId', { sellerId })
        .orderBy('d.createdAt', 'DESC')
        .getMany(),
    ]);

    const totalRevenu = demandes
      .filter(d => ['PAYER', 'EN_LIVRAISON', 'LIVRER', 'COMPLETER'].includes(d.statut))
      .reduce((sum, d) => sum + Number(d.montantTotal || 0), 0);

    const demandesByStatut: Record<string, number> = {};
    demandes.forEach(d => {
      demandesByStatut[d.statut] = (demandesByStatut[d.statut] || 0) + 1;
    });

    const stockBas = produits.filter(p => p.quantite <= 5);

    return {
      produitsCount: produits.length,
      demandesCount: demandes.length,
      totalRevenu,
      demandesByStatut,
      stockBas: stockBas.map(p => ({ id: p.id, nom: p.nom, quantite: p.quantite })),
      recentDemandes: demandes.slice(0, 10),
      recentProduits: produits.slice(0, 5),
    };
  }
}
