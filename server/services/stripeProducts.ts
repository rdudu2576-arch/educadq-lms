/**
 * Stripe Products Configuration
 * Define todos os produtos e preços dos cursos
 */

export interface CourseProduct {
  courseId: number;
  stripeProductId?: string;
  stripePriceId?: string;
  name: string;
  description: string;
  price: number; // em centavos
  currency: string;
}

/**
 * Mapeamento de cursos para produtos Stripe
 * Este arquivo será usado para criar/sincronizar produtos no Stripe
 */
export const courseProducts: CourseProduct[] = [
  // Adicionar cursos conforme necessário
  // Exemplo:
  // {
  //   courseId: 1,
  //   name: "Curso de Dependência Química",
  //   description: "Formação especializada em dependência química",
  //   price: 29900, // R$ 299.00
  //   currency: "BRL",
  // },
];

/**
 * Obtém o produto Stripe para um curso
 */
export function getCourseProduct(courseId: number): CourseProduct | undefined {
  return courseProducts.find((p) => p.courseId === courseId);
}

/**
 * Atualiza o ID do produto Stripe para um curso
 */
export function updateCourseProductId(courseId: number, stripeProductId: string): void {
  const product = courseProducts.find((p) => p.courseId === courseId);
  if (product) {
    product.stripeProductId = stripeProductId;
  }
}

/**
 * Atualiza o ID do preço Stripe para um curso
 */
export function updateCoursePriceId(courseId: number, stripePriceId: string): void {
  const product = courseProducts.find((p) => p.courseId === courseId);
  if (product) {
    product.stripePriceId = stripePriceId;
  }
}
