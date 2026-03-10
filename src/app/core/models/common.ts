/** Campos base presentes em todas as entidades retornadas pela API. */
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string | null;
}
