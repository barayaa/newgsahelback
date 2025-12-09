export class CreateProduitDto {
  id: number;
  nom: string;
  description: string;
  prix: number;
  quantite: number;
  image?: string;
  unite: number;
  category: number;
  user: number;
  localite?: number;
}
