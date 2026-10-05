const { body, param, query, validationResult } = require("express-validator");

function responderErroresValidacion(req, res, next) {
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).json({
      error: "Datos inválidos.",
      detalles: errores.array().map((e) => ({ campo: e.path, mensaje: e.msg })),
    });
  }

  next();
}

function soloCamposBody(camposPermitidos) {
  return (req, res, next) => {
    const extras = Object.keys(req.body || {}).filter(
      (campo) => !camposPermitidos.includes(campo)
    );

    if (extras.length > 0) {
      return res.status(400).json({
        error: `Campos no permitidos: ${extras.join(", ")}.`,
      });
    }

    next();
  };
}

function soloQuery(camposPermitidos) {
  return (req, res, next) => {
    const extras = Object.keys(req.query || {}).filter(
      (campo) => !camposPermitidos.includes(campo)
    );

    if (extras.length > 0) {
      return res.status(400).json({
        error: `Parámetros de consulta no permitidos: ${extras.join(", ")}.`,
      });
    }

    next();
  };
}

const validarId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El id debe ser un entero positivo.")
    .toInt(),
  responderErroresValidacion,
];

const validarRectangulo = [
  body("lado1")
    .exists({ checkNull: true })
    .withMessage("lado1 es obligatorio.")
    .bail()
    .custom((valor) => typeof valor === "number" && Number.isFinite(valor) && valor > 0)
    .withMessage("lado1 debe ser un número mayor que cero."),
  body("lado2")
    .exists({ checkNull: true })
    .withMessage("lado2 es obligatorio.")
    .bail()
    .custom((valor) => typeof valor === "number" && Number.isFinite(valor) && valor > 0)
    .withMessage("lado2 debe ser un número mayor que cero."),
  responderErroresValidacion,
];

const validarFiltroCuadrado = [
  query("cuadrado")
    .optional()
    .isIn(["true", "false"])
    .withMessage("cuadrado debe ser 'true' o 'false'."),
  responderErroresValidacion,
];

module.exports = {
  responderErroresValidacion,
  soloCamposBody,
  soloQuery,
  validarId,
  validarRectangulo,
  validarFiltroCuadrado,
};
