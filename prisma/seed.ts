import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const n = await prisma.siswa.count();
  if (n > 0) {
    console.log("seed dilewati (sudah ada data)");
    return;
  }

  await prisma.siswa.createMany({
    data: [
      { nama: "Andi Pratama", kelas: "5A", kartuId: "KNT-100001", saldo: 100000, batasHarian: 25000 },
      { nama: "Budi Setiawan", kelas: "5A", kartuId: "KNT-100002", saldo: 50000, batasHarian: 20000 },
      { nama: "Citra Ayu", kelas: "6B", kartuId: "KNT-100003", saldo: 75000, batasHarian: 30000 },
    ],
  });

  await prisma.produk.createMany({
    data: [
      { nama: "Nasi + Ayam Goreng", harga: 12000 },
      { nama: "Mie Goreng", harga: 8000 },
      { nama: "Es Teh Manis", harga: 4000 },
      { nama: "Roti Cokelat", harga: 5000 },
      { nama: "Susu Kotak", harga: 6000 },
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
