import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { PRODUCTS, SERVICES } from '../src/lib/data';
import { SAMPLE_BLOGS } from '../src/lib/seed-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed admin user
  const hashedPassword = await hash('Admin@123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@spectrapackmachines.com' },
    update: {},
    create: {
      email: 'admin@spectrapackmachines.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'admin'
    }
  });
  console.log('✅ Admin user created');

  // Seed products
  for (let i = 0; i < PRODUCTS.length; i++) {
    const product = PRODUCTS[i];
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        title: product.title,
        slug: product.slug,
        category: product.category,
        description: product.shortDesc,
        content: product.description,
        features: JSON.stringify(product.features),
        specs: JSON.stringify(product.specs),
        faqs: JSON.stringify(product.faqs),
        image: product.image,
        gallery: JSON.stringify([product.image]),
        seoTitle: `${product.title} | Spectra Pack Machines`,
        seoDesc: product.shortDesc,
        order: i
      }
    });
  }
  console.log(`✅ ${PRODUCTS.length} products created`);

  // Seed services
  for (let i = 0; i < SERVICES.length; i++) {
    const service = SERVICES[i];
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: {
        title: service.title,
        slug: service.slug,
        description: service.description,
        content: service.content,
        icon: service.icon,
        order: i
      }
    });
  }
  console.log(`✅ ${SERVICES.length} services created`);

  // Seed sample blog posts
  for (const blog of SAMPLE_BLOGS) {
    await prisma.blog.upsert({
      where: { slug: blog.slug },
      update: {},
      create: {
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        content: blog.content,
        image: blog.image,
        published: blog.published,
        seoTitle: blog.seoTitle,
        seoDesc: blog.seoDesc,
      }
    });
  }
  console.log(`✅ ${SAMPLE_BLOGS.length} blog posts created`);

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
