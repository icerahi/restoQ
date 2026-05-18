import { SystemRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "../src/config/db";
import { env } from "../src/config/env";

async function main() {
  const email = env.superuser.email;
  const password = env.superuser.password;
  const existingUser = await prisma.systemUser.findUnique({
    where: { email },
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(password, env.bcrypt_salt_rounds);
    const superuser = await prisma.systemUser.create({
      data: {
        email: email,
        password: hashedPassword,
        name: "Super Admin",
        role: SystemRole.SUPER_USER,
      },
    });
    console.log("Seeded SUPER_USER account.");
    console.log(`Super User Email: ${superuser.email}
                 Super User Name: ${superuser.name}
                 Super User Password: ${password}`);
  } else {
    console.log("SUPER_USER account already exists.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
