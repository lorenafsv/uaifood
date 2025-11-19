import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import bcrypt from "bcrypt";

async function main() {
  console.log("Iniciando seed completo do banco...");

  // ---------------------------------------------------------------------
  // 0. LIMPEZA COMPLETA DAS TABELAS
  // ---------------------------------------------------------------------
  console.log("Limpando tabelas...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.item.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  console.log("Tabelas limpas");



  // ---------------------------------------------------------------------
  // 1. CRIA ADMINISTRADOR DO SISTEMA
  // ---------------------------------------------------------------------
  // upsert é usado para permitir rodar o seed várias vezes sem duplicar.
  const adminPass = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@uaifood.com" },
    update: {},
    create: {
      name: "Administrador",
      phone: "34 99999-9999",
      email: "admin@uaifood.com",
      password: adminPass,
      type: "ADMIN",
    },
  });

  console.log("Admin criado:", admin.email);



  // ---------------------------------------------------------------------
  // 2. CRIA CLIENTES DE EXEMPLO
  // ---------------------------------------------------------------------
  const clientPassword = await bcrypt.hash("cliente123", 10);

  const clientsData = [
    { name: "Ana Souza", phone: "34 98888-1111", email: "ana@teste.com" },
    { name: "Carlos Lima", phone: "34 97777-2222", email: "carlos@teste.com" },
    { name: "Mariana Alves", phone: "34 96666-3333", email: "mariana@teste.com" },
  ];

  const clients = [];

  for (const c of clientsData) {
    const client = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        ...c,
        password: clientPassword,
        type: "CLIENT",
      },
    });

    clients.push(client);
  }

  console.log("Clientes criados:", clients.length);



  // ---------------------------------------------------------------------
  // 3. CRIA CATEGORIAS E OBTÉM OS IDs
  // ---------------------------------------------------------------------
  // Usamos deleteMany para garantir base “zerada”.
  await prisma.category.deleteMany();

  await prisma.category.createMany({
    data: [
      { description: "Lanches" },
      { description: "Bebidas" },
      { description: "Sobremesas" },
      { description: "Promoções" },
    ],
  });

  console.log("Categorias inseridas");

  // Busca os IDs gerados pelo banco
  const categorias = await prisma.category.findMany();

  // Mapeia categorias por nome para facilitar uso
  const cat = {
    lanches: categorias.find(c => c.description === "Lanches"),
    bebidas: categorias.find(c => c.description === "Bebidas"),
    sobremesas: categorias.find(c => c.description === "Sobremesas"),
    promocoes: categorias.find(c => c.description === "Promoções"),
  };



  // ---------------------------------------------------------------------
  // 4. CRIA ITENS USANDO IDs REAIS DE CATEGORIA
  // ---------------------------------------------------------------------
  await prisma.item.deleteMany();

  await prisma.item.createMany({
    data: [
      {
        description: "X-Salada",
        unitPrice: 18.9,
        imageUrl: "https://i.imgur.com/pJ5bW5P.png",
        categoryId: cat.lanches.id,
      },
      {
        description: "X-Bacon",
        unitPrice: 22.5,
        imageUrl: "https://i.imgur.com/O7M7XGO.png",
        categoryId: cat.lanches.id,
      },
      {
        description: "Batata Frita",
        unitPrice: 12.5,
        imageUrl: "https://i.imgur.com/VRJFH1Q.png",
        categoryId: cat.lanches.id,
      },
      {
        description: "Coca-Cola 350ml",
        unitPrice: 6.5,
        imageUrl: "https://i.imgur.com/Ot8XQ6j.png",
        categoryId: cat.bebidas.id,
      },
      {
        description: "Suco de Laranja",
        unitPrice: 7.5,
        imageUrl: "https://i.imgur.com/5hKzKk0.png",
        categoryId: cat.bebidas.id,
      },
      {
        description: "Milkshake Chocolate",
        unitPrice: 14.9,
        imageUrl: "https://i.imgur.com/qoKapcL.png",
        categoryId: cat.sobremesas.id,
      },
      {
        description: "Pudim",
        unitPrice: 8.9,
        imageUrl: "https://i.imgur.com/cXvA2Hv.png",
        categoryId: cat.sobremesas.id,
      },
      {
        description: "Combo X-Salada + Batata + Refri",
        unitPrice: 29.9,
        imageUrl: "https://i.imgur.com/uA1Fjnz.png",
        categoryId: cat.promocoes.id,
      },
    ],
  });

  console.log("Itens criados");



  // ---------------------------------------------------------------------
  // 5. CRIA ENDEREÇOS PARA OS CLIENTES
  // ---------------------------------------------------------------------
  // Como Address tem userId UNIQUE, 1 endereço por cliente.
  await prisma.address.deleteMany();

  for (const c of clients) {
    await prisma.address.create({
      data: {
        street: "Rua Principal",
        number: "123",
        district: "Centro",
        city: "Uberaba",
        state: "MG",
        zipCode: "38000-000",
        userId: c.id,
      },
    });
  }

  console.log("Endereços criados:", clients.length);



  // ---------------------------------------------------------------------
  // 6. CRIA PEDIDOS + ITENS + TOTAL CALCULADO
  // ---------------------------------------------------------------------
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  // Itens atuais após createMany
  const allItems = await prisma.item.findMany();

  const exampleOrders = [
    {
      clientId: clients[0].id,
      status: "delivered",
      paymentMethod: "CREDIT",
      items: [
        { itemId: allItems[0].id, quantity: 2 },
        { itemId: allItems[3].id, quantity: 1 },
      ],
    },
    {
      clientId: clients[1].id,
      status: "preparing",
      paymentMethod: "PIX",
      items: [
        { itemId: allItems[1].id, quantity: 1 },
        { itemId: allItems[5].id, quantity: 1 },
      ],
    },
    {
      clientId: clients[2].id,
      status: "pending",
      paymentMethod: "DEBIT",
      items: [
        { itemId: allItems[7].id, quantity: 1 },
      ],
    },
  ];

  for (const ord of exampleOrders) {

    // Cria o pedido inicialmente com total = 0
    const order = await prisma.order.create({
      data: {
        clientId: ord.clientId,
        status: ord.status,
        paymentMethod: ord.paymentMethod,
        total: 0,
      },
    });

    // Cria os itens do pedido
    for (const it of ord.items) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          itemId: it.itemId,
          quantity: it.quantity,
        },
      });
    }

    // Carrega itens reais para calcular o total
    const orderWithItems = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: { include: { item: true } },
      },
    });

    const total = orderWithItems.orderItems.reduce(
      (sum, oi) => sum + oi.item.unitPrice * oi.quantity,
      0
    );

    // Atualiza o pedido com o total final
    await prisma.order.update({
      where: { id: order.id },
      data: { total },
    });
  }

  console.log("Pedidos completos criados!");
  console.log("Seed concluído com sucesso!");
}



// =============================================================================
// Execução principal com tratamento de erro e desconexão garantida
// =============================================================================
main()
  .catch((err) => {
    console.error("Erro no seed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
