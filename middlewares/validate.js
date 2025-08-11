// Middleware genérico para validar req con Zod y lanzar http-errors
import { ZodError } from "zod";


export const zodValidator = (schema, property = "body") => {
  return (req, res, next) => {
    try {
      // Validamos los datos usando Zod
      const parsedData = schema.parse(req[property]);

      // En vez de sobreescribir, fusionamos el resultado validado
      if (property === "query") {
        Object.assign(req.query, parsedData);
      } else if (property === "params") {
        Object.assign(req.params, parsedData);
      } else {
        req[property] = parsedData;
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      next(err);
    }
  };
};