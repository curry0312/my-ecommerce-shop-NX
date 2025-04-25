import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const initializeConfig = async () => {
  try {
    const existingConfig = await prisma.site_config.findFirst();

    if (!existingConfig) {
      await prisma.site_config.create({
        data: {
          categories: ["Eletronics", "Fashion"],
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export default initializeConfig;
