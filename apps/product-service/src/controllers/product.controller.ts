import { NotFoundError, ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import { File } from "buffer";
import { Response, Request, NextFunction } from "express";

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.site_config.findFirst();

    console.log("config", config);

    if (!config) {
      return res.status(404).json({
        message: "Site config not found",
      });
    } else {
      return res.status(200).json({
        message: "Site config found",
        data: config,
      });
    }
  } catch (error) {
    return next(error);
  }
};

export const createDiscountCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, discountValue, discountCode, discountType } = req.body;

    const isDiscountCodeExist = await prisma.discount_codes.findUnique({
      where: {
        discountCode,
      },
    });

    if (isDiscountCodeExist) {
      return next(new ValidationError("This discountCode alreadt existed"));
    }

    const newDiscountCode = await prisma.discount_codes.create({
      data: {
        title,
        discountCode,
        discountValue,
        discountType,
        sellerId: req.account.id,
      },
    });

    return res.status(200).json({
      message: "newDiscountCode created successfully",
      data: newDiscountCode,
    });
  } catch (error) {
    return next(error);
  }
};

export const getDiscountCodes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sellerId = req.account.id;

  const discountCodes = await prisma.discount_codes.findMany({
    where: {
      sellerId,
    },
  });

  if (!discountCodes) {
    return next(new NotFoundError("Discount codes not found"));
  }

  return res.status(200).json({
    message: "Discount codes found",
    data: discountCodes,
  });
};

export const getSpecificDiscountCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { discountCode } = req.params;

    console.log("discountCode", discountCode);

    const discountCodeData = await prisma.discount_codes.findUnique({
      where: { discountCode: discountCode },
    });

    if (!discountCodeData) {
      return next(new NotFoundError("Discount code not found"));
    }

    return res.status(200).json({
      message: "Discount code found",
      data: discountCodeData,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteDiscountCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { discountCodeId } = req.params;
    console.log("discountCodeId", discountCodeId);

    const sellerId = req.account.id;

    const discountCode = await prisma.discount_codes.findUnique({
      where: { id: discountCodeId },
      select: {
        id: true,
        sellerId: true,
      },
    });

    if (!discountCode) {
      return next(new NotFoundError("Diiscount code not found"));
    }

    if (discountCode.sellerId !== sellerId) {
      return next(new ValidationError("Unauthorized access"));
    }

    await prisma.discount_codes.delete({ where: { id: discountCodeId } });

    return res
      .status(200)
      .json({ message: "Discount code successfully deleted" });
  } catch (error) {
    return next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      description,
      price,
      discountCode,
      category,
      tags,
      stock,
      cash_on_delivery,
      custom_specifications,
      images,
    } = req.body;

    const discountCodeData = await prisma.discount_codes.findUnique({
      where: { discountCode: discountCode },
    });

    const sellerId = req.account.id;
    const shopId = req.account.shop.id;

    const created = await prisma.$transaction(async (tx) => {
      // 1. 建立圖片（會回傳已建立的圖）
      const createdImages = await Promise.all(
        images.map(({ url }: { file: File; url: string }) =>
          tx.images.create({
            data: { url, sellerId, shopId },
          })
        )
      );

      // 2. 建立商品並連結圖片
      const newProduct = await tx.products.create({
        data: {
          title,
          description,
          price,
          category,
          tags,
          stock,
          cash_on_delivery,
          custom_specifications,
          sellerId,
          shopId,
          discount_codesId: discountCodeData?.id,
          images: {
            connect: createdImages.map((image) => ({ id: image.id })),
          },
        },
      });

      return newProduct;
    });

    return res.status(200).json({
      message: "Product created successfully",
      data: created,
    });
  } catch (error) {
    return next(error);
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sellerId = req.account.id;

  const products = await prisma.products.findMany({
    where: {
      sellerId,
    },
    include: {
      images: true,
    },
  });

  if (!products) {
    return next(new NotFoundError("Products not found"));
  }

  return res.status(200).json({
    message: "Products found",
    data: products,
  });
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: {
        id: true,
        sellerId: true,
      },
    });

    if (!product) {
      return next(new NotFoundError("Product not found"));
    } else if (product.sellerId !== req.account.id) {
      return next(new ValidationError("Unauthorized access"));
    }

    await prisma.products.delete({ where: { id: productId } });

    return res.status(200).json({ message: "Product successfully deleted" });
  } catch (error) {
    return next(error);
  }
};
