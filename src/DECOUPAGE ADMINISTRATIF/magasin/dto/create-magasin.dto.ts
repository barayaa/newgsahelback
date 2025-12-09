export class CreateMagasinDto {
  id: number;
  nom: string;
  description: string;
  localite: number;

  magasinProduits?: number[];
}
