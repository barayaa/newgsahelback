export class CreateProfileDto {
  adresse?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
  dateNaissance?: Date;
  userId: number; // Champ obligatoire pour lier le profil à un utilisateur
}
