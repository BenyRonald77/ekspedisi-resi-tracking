import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const n = await prisma.zona.count();
  if (n > 0) {
    console.log("seed dilewati (sudah ada data)");
    return;
  }
  await prisma.zona.createMany({
    data: [
      { nama: "Jabodetabek", tarifPerKg: 9000, estimasiHari: 1 },
      { nama: "Jawa", tarifPerKg: 12000, estimasiHari: 2 },
      { nama: "Sumatera", tarifPerKg: 18000, estimasiHari: 4 },
      { nama: "Kalimantan", tarifPerKg: 22000, estimasiHari: 5 },
      { nama: "Sulawesi & Timur", tarifPerKg: 28000, estimasiHari: 7 },
    ],
  });
  await prisma.hub.createMany({
    data: [
      { nama: "Hub Jakarta Pusat", kota: "Jakarta" },
      { nama: "Hub Bandung", kota: "Bandung" },
      { nama: "Hub Surabaya", kota: "Surabaya" },
      { nama: "Hub Medan", kota: "Medan" },
      { nama: "Hub Makassar", kota: "Makassar" },
    ],
  });
  console.log("seed selesai");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
