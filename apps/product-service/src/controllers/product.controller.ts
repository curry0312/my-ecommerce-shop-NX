import { NotFoundError, ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import { Response, Request, NextFunction } from "express";

export const createProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //   const { name, description, price } = req.body;
  return res.status(200).json({
    message: "Product created successfully",
  });
};

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

export const deleteDiscountCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { discountCodeId } = req.params;
    console.log("discountCodeId",discountCodeId);

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
