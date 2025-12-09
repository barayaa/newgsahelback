export class CreateCategoryDto {
  id: number;
  nom: string;
  description: string;
  produits?: number[];
}
