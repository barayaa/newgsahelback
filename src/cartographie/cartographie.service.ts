import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produit } from 'src/MARKET PLACE/produits/entities/produit.entity';
import { MagasinProduit } from 'src/DECOUPAGE ADMINISTRATIF/magasin/entities/magasin_produit.entity';
import { Category } from 'src/MARKET PLACE/categories/entities/category.entity';
import { Region } from 'src/DECOUPAGE ADMINISTRATIF/region/entities/region.entity';

const NIGER_REGIONS = ['Agadez','Diffa','Dosso','Maradi','Niamey','Tahoua','Tillabéry','Zinder'];

// Normalise les variantes d'orthographe (Tillabéri/Tillabéry etc.)
function normaliseRegion(nom: string): string {
  if (!nom) return 'Non classé';
  if (nom.toLowerCase().includes('tillab')) return 'Tillabéry';
  return nom;
}

@Injectable()
export class CartographieService {
  constructor(
    @InjectRepository(Produit)       private produitRepo:       Repository<Produit>,
    @InjectRepository(MagasinProduit) private magasinProduitRepo: Repository<MagasinProduit>,
    @InjectRepository(Category)      private categoryRepo:      Repository<Category>,
    @InjectRepository(Region)        private regionRepo:        Repository<Region>,
  ) {}

  // ── Toutes les catégories (pour les filtres) ──────────────────────────────
  async getCategories() {
    return this.categoryRepo.find({ order: { nom: 'ASC' } });
  }

  // ── Années disponibles ────────────────────────────────────────────────────
  async getAnnees(): Promise<number[]> {
    const result = await this.produitRepo
      .createQueryBuilder('p')
      .select('DISTINCT EXTRACT(YEAR FROM p.createdAt)::int', 'annee')
      .orderBy('annee', 'DESC')
      .getRawMany();
    return result.map((r) => r.annee);
  }

  // ── Données de production (produits par région/catégorie/année) ───────────
  async getProduction(categorieId?: number, annee?: number) {
    const qb = this.produitRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'cat')
      .leftJoinAndSelect('p.localite', 'loc')
      .leftJoinAndSelect('loc.commune', 'com')
      .leftJoinAndSelect('com.departement', 'dep')
      .leftJoinAndSelect('dep.region', 'reg')
      .leftJoinAndSelect('p.unite', 'unite');

    if (categorieId) qb.andWhere('cat.id = :categorieId', { categorieId });
    if (annee)       qb.andWhere("EXTRACT(YEAR FROM p.createdAt) = :annee", { annee });

    const produits = await qb.getMany();

    // ── Agrégation par région ────────────────────────────────────────────────
    const regionMap: Record<string, {
      region: string; totalQuantite: number; totalVendeurs: Set<number>;
      categories: Record<string, number>;
    }> = {};

    // Initialiser toutes les régions du Niger à 0
    for (const r of NIGER_REGIONS) {
      regionMap[r] = { region: r, totalQuantite: 0, totalVendeurs: new Set(), categories: {} };
    }

    let totalGlobal = 0;
    for (const p of produits) {
      const regionNom = normaliseRegion(p.localite?.commune?.departement?.region?.nom);
      if (!regionMap[regionNom]) {
        regionMap[regionNom] = { region: regionNom, totalQuantite: 0, totalVendeurs: new Set(), categories: {} };
      }
      const qte = Number(p.quantite) || 0;
      regionMap[regionNom].totalQuantite += qte;
      if (p.user?.id) regionMap[regionNom].totalVendeurs.add(p.user?.id);
      const catNom = p.category?.nom || 'Autre';
      regionMap[regionNom].categories[catNom] = (regionMap[regionNom].categories[catNom] || 0) + qte;
      totalGlobal += qte;
    }

    const parRegion = Object.values(regionMap).map((r) => ({
      region: r.region,
      totalQuantite: r.totalQuantite,
      totalVendeurs: r.totalVendeurs.size,
      repartition: totalGlobal > 0 ? Math.round((r.totalQuantite / totalGlobal) * 1000) / 10 : 0,
      categories: Object.entries(r.categories)
        .map(([nom, quantite]) => ({ nom, quantite }))
        .sort((a, b) => b.quantite - a.quantite),
    }));

    // ── Agrégation par catégorie ──────────────────────────────────────────────
    const catMap: Record<string, { categorie: string; totalQuantite: number; regions: Record<string, number> }> = {};
    for (const p of produits) {
      const catNom  = p.category?.nom || 'Autre';
      const regNom  = normaliseRegion(p.localite?.commune?.departement?.region?.nom);
      const qte     = Number(p.quantite) || 0;
      if (!catMap[catNom]) catMap[catNom] = { categorie: catNom, totalQuantite: 0, regions: {} };
      catMap[catNom].totalQuantite += qte;
      catMap[catNom].regions[regNom] = (catMap[catNom].regions[regNom] || 0) + qte;
    }

    // ── Évolution par année (3 dernières années) ──────────────────────────────
    const evolutionParAnnee = await this._getEvolutionProduction(categorieId);

    // ── Top produits ──────────────────────────────────────────────────────────
    const topProduits = produits
      .sort((a, b) => Number(b.quantite) - Number(a.quantite))
      .slice(0, 10)
      .map((p) => ({
        id: p.id, nom: p.nom, quantite: p.quantite,
        region: normaliseRegion(p.localite?.commune?.departement?.region?.nom),
        categorie: p.category?.nom,
        unite: p.unite?.symbole,
      }));

    return {
      parRegion,
      parCategorie: Object.values(catMap).sort((a, b) => b.totalQuantite - a.totalQuantite),
      evolutionParAnnee,
      topProduits,
      totalGeneral: totalGlobal,
      totalProduits: produits.length,
    };
  }

  private async _getEvolutionProduction(categorieId?: number) {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear];
    const result: Record<string, Record<string, number>> = {};

    for (const year of years) {
      const qb = this.produitRepo
        .createQueryBuilder('p')
        .leftJoin('p.category', 'cat')
        .leftJoin('p.localite', 'loc')
        .leftJoin('loc.commune', 'com')
        .leftJoin('com.departement', 'dep')
        .leftJoin('dep.region', 'reg')
        .select('reg.nom', 'region')
        .addSelect('SUM(p.quantite)', 'total')
        .where("EXTRACT(YEAR FROM p.createdAt) = :year", { year })
        .groupBy('reg.nom');

      if (categorieId) qb.andWhere('cat.id = :categorieId', { categorieId });

      const rows = await qb.getRawMany();
      result[year] = {};
      for (const row of rows) {
        result[year][normaliseRegion(row.region)] = Number(row.total) || 0;
      }
    }
    return { annees: years.map(String), data: result };
  }

  // ── Données de stockage (produits dans les magasins par région) ───────────
  async getStockage(categorieId?: number, annee?: number) {
    const qb = this.magasinProduitRepo
      .createQueryBuilder('mp')
      .leftJoinAndSelect('mp.magasin', 'mag')
      .leftJoinAndSelect('mag.localite', 'loc')
      .leftJoinAndSelect('loc.commune', 'com')
      .leftJoinAndSelect('com.departement', 'dep')
      .leftJoinAndSelect('dep.region', 'reg')
      .leftJoinAndSelect('mp.produit', 'p')
      .leftJoinAndSelect('p.category', 'cat')
      .leftJoinAndSelect('p.unite', 'unite');

    if (categorieId) qb.andWhere('cat.id = :categorieId', { categorieId });
    if (annee) qb.andWhere("EXTRACT(YEAR FROM mp.createdAt) = :annee", { annee });

    const items = await qb.getMany();

    const regionMap: Record<string, {
      region: string; totalStocke: number; nbMagasins: Set<number>;
      categories: Record<string, number>;
    }> = {};

    for (const r of NIGER_REGIONS) {
      regionMap[r] = { region: r, totalStocke: 0, nbMagasins: new Set(), categories: {} };
    }

    let totalGlobal = 0;
    for (const mp of items) {
      const regionNom = normaliseRegion(mp.magasin?.localite?.commune?.departement?.region?.nom);
      if (!regionMap[regionNom]) {
        regionMap[regionNom] = { region: regionNom, totalStocke: 0, nbMagasins: new Set(), categories: {} };
      }
      const qte = Number(mp.produit?.quantite) || 0;
      regionMap[regionNom].totalStocke += qte;
      if (mp.magasin?.id) regionMap[regionNom].nbMagasins.add(mp.magasin.id);
      const catNom = mp.produit?.category?.nom || 'Autre';
      regionMap[regionNom].categories[catNom] = (regionMap[regionNom].categories[catNom] || 0) + qte;
      totalGlobal += qte;
    }

    const parRegion = Object.values(regionMap).map((r) => ({
      region: r.region,
      totalStocke: r.totalStocke,
      nbMagasins: r.nbMagasins.size,
      repartition: totalGlobal > 0 ? Math.round((r.totalStocke / totalGlobal) * 1000) / 10 : 0,
      categories: Object.entries(r.categories)
        .map(([nom, quantite]) => ({ nom, quantite }))
        .sort((a, b) => b.quantite - a.quantite),
    }));

    // Top magasins
    const magasinMap: Record<number, { nom: string; region: string; totalStocke: number }> = {};
    for (const mp of items) {
      const id  = mp.magasin?.id;
      const nom = mp.magasin?.nom || '—';
      const reg = normaliseRegion(mp.magasin?.localite?.commune?.departement?.region?.nom);
      if (!magasinMap[id]) magasinMap[id] = { nom, region: reg, totalStocke: 0 };
      magasinMap[id].totalStocke += Number(mp.produit?.quantite) || 0;
    }
    const topMagasins = Object.values(magasinMap).sort((a, b) => b.totalStocke - a.totalStocke).slice(0, 10);

    // Evolution
    const evolutionParAnnee = await this._getEvolutionStockage(categorieId);

    return { parRegion, topMagasins, evolutionParAnnee, totalGeneral: totalGlobal };
  }

  private async _getEvolutionStockage(categorieId?: number) {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear];
    const result: Record<string, Record<string, number>> = {};

    for (const year of years) {
      const qb = this.magasinProduitRepo
        .createQueryBuilder('mp')
        .leftJoin('mp.magasin', 'mag')
        .leftJoin('mag.localite', 'loc')
        .leftJoin('loc.commune', 'com')
        .leftJoin('com.departement', 'dep')
        .leftJoin('dep.region', 'reg')
        .leftJoin('mp.produit', 'p')
        .leftJoin('p.category', 'cat')
        .select('reg.nom', 'region')
        .addSelect('SUM(p.quantite)', 'total')
        .where("EXTRACT(YEAR FROM mp.createdAt) = :year", { year })
        .groupBy('reg.nom');

      if (categorieId) qb.andWhere('cat.id = :categorieId', { categorieId });

      const rows = await qb.getRawMany();
      result[year] = {};
      for (const row of rows) {
        result[year][normaliseRegion(row.region)] = Number(row.total) || 0;
      }
    }
    return { annees: years.map(String), data: result };
  }

  // ── Résumé global ──────────────────────────────────────────────────────────
  async getResume() {
    const [totalProduits, totalMagasins, totalCategories, totalRegions] = await Promise.all([
      this.produitRepo.count(),
      this.magasinProduitRepo.count(),
      this.categoryRepo.count(),
      this.regionRepo.count(),
    ]);

    const topCats = await this.produitRepo
      .createQueryBuilder('p')
      .leftJoin('p.category', 'cat')
      .select('cat.nom', 'categorie')
      .addSelect('SUM(p.quantite)', 'total')
      .groupBy('cat.nom')
      .orderBy('total', 'DESC')
      .limit(5)
      .getRawMany();

    return { totalProduits, totalMagasins, totalCategories, totalRegions, topCats };
  }
}
