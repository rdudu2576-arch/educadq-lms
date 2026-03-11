/**
 * Stripe Products Configuration
 * Define todos os produtos e preços dos cursos
 */
/**
 * Mapeamento de cursos para produtos Stripe
 * Este arquivo será usado para criar/sincronizar produtos no Stripe
 */
export var courseProducts = [
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
export function getCourseProduct(courseId) {
    return courseProducts.find(function (p) { return p.courseId === courseId; });
}
/**
 * Atualiza o ID do produto Stripe para um curso
 */
export function updateCourseProductId(courseId, stripeProductId) {
    var product = courseProducts.find(function (p) { return p.courseId === courseId; });
    if (product) {
        product.stripeProductId = stripeProductId;
    }
}
/**
 * Atualiza o ID do preço Stripe para um curso
 */
export function updateCoursePriceId(courseId, stripePriceId) {
    var product = courseProducts.find(function (p) { return p.courseId === courseId; });
    if (product) {
        product.stripePriceId = stripePriceId;
    }
}
