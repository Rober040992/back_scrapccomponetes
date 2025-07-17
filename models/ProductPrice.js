import mongoose from "mongoose";

const productPriceSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    price: {
      type: String,
      required: true,
      min: 0,
      
    },
    currency: {
      type: String,
      default: "EUR",
      enum: ["EUR", "USD", "GBP"],
    },
    image: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "La imagen debe ser una URL válida",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Añade automáticamente createdAt y updatedAt
    collection: "productPrices", // Nombre explícito de la colección
  }
);

// Índices compuestos para consultas frecuentes
productPriceSchema.index({ category: 1, price: 1 });
productPriceSchema.index({ isActive: 1, createdAt: -1 });
productPriceSchema.index({ slug: 1, isActive: 1 });

// Middleware para actualizar lastUpdated
productPriceSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.lastUpdated = new Date();
  }
  next();
});

// Métodos estáticos útiles
productPriceSchema.statics.findActiveProducts = function () {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

productPriceSchema.statics.findByPriceRange = function (min, max) {
  return this.find({
    price: { $gte: min, $lte: max },
    isActive: true,
  });
};

// Configurar toJSON para incluir virtuals
productPriceSchema.set("toJSON", { virtuals: true });

const ProductPrice = mongoose.model('ProductPrice', productPriceSchema);
export default ProductPrice;