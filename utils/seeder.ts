import { Restaurant, Category, Product, FurnitureStore, FurnitureCategory, FurnitureProduct, Admin } from "../models";
import { AccountStatus, CategoryStatus, ProductStatus } from "../types/enums";

export async function seedDB() {
  try {
    /* ──────────────────────────────────────────────────────────
       1. SEED FOOD VERTICAL (IF EMPTY)
       ────────────────────────────────────────────────────────── */
    const restaurantCount = await Restaurant.countDocuments();
    if (restaurantCount === 0) {
      console.log("🌱 Seeding database with dummy restaurants, categories, and products...");

      // Create Restaurant 1: one8 Commune
      const restaurant1 = await Restaurant.create({
        restaurantName: "one8 Commune",
        ownerName: "Virat Kohli",
        email: "pizza@grandpizzeria.com",
        phone: "9876543210",
        password: "password123",
        address: "18 World Cup Avenue, Cricket Enclave, New Delhi",
        status: AccountStatus.ACTIVE,
        isEmailVerified: true,
        is3dEnabled: true,
        heroImage: "uploads/restaurants/one8-commune.png",
      });

      // Create Restaurant 2: Burger & Co.
      const restaurant2 = await Restaurant.create({
        restaurantName: "Burger & Co.",
        ownerName: "John Smith",
        email: "contact@burgerco.com",
        phone: "9876543211",
        password: "password123",
        address: "789 Bun Way, Food Court",
        status: AccountStatus.ACTIVE,
        isEmailVerified: true,
        is3dEnabled: false,
        heroImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
      });

      // Create Categories for Restaurant 1
      const catPizzas = await Category.create({
        name: "Pizzas",
        description: "Authentic wood-fired Italian pizzas",
        image: "http://localhost:3001/foods/margherita-pizza.jpg",
        status: CategoryStatus.ACTIVE,
        restaurantId: restaurant1._id,
      });

      const catBeverages = await Category.create({
        name: "Sides & Desserts",
        description: "Sweet treats and side items",
        image: "http://localhost:3001/foods/cake.jpeg",
        status: CategoryStatus.ACTIVE,
        restaurantId: restaurant1._id,
      });

      // Create Categories for Restaurant 2
      const catBurgers = await Category.create({
        name: "Burgers",
        description: "Juicy flame-grilled burgers with fresh toppings",
        image: "http://localhost:3001/foods/burger.jpg",
        status: CategoryStatus.ACTIVE,
        restaurantId: restaurant2._id,
      });

      const catSides = await Category.create({
        name: "Sides & Salads",
        description: "Perfect companions for your burger meal",
        image: "http://localhost:3001/foods/salad.jpg",
        status: CategoryStatus.ACTIVE,
        restaurantId: restaurant2._id,
      });

      // Create Products for Restaurant 1 (The Grand Pizzeria)
      await Product.create([
        {
          title: "Margherita Pizza",
          description: "Classic Italian pizza with rich tomato sauce, fresh mozzarella cheese, and sweet basil leaves.",
          mrp: 499,
          price: 399,
          image: "http://localhost:3001/foods/margherita-pizza.jpg",
          arModelPath: "http://localhost:3001/food model/food model/pizza.glb",
          categoryId: catPizzas._id,
          restaurantId: restaurant1._id,
          status: ProductStatus.ACTIVE,
          stock: 50,
          isVegetarian: true,
          isAvailable: true,
          preparationTime: 12,
        },
        {
          title: "Pepperoni Feast Pizza",
          description: "Loads of spicy pepperoni slices, mozzarella cheese, and a double cheese crust.",
          mrp: 599,
          price: 499,
          image: "http://localhost:3001/foods/margherita-pizza.jpg",
          arModelPath: "http://localhost:3001/food model/food model/pizza.glb",
          categoryId: catPizzas._id,
          restaurantId: restaurant1._id,
          status: ProductStatus.ACTIVE,
          stock: 40,
          isVegetarian: false,
          isAvailable: true,
          preparationTime: 15,
        },
        {
          title: "Chocolate Lava Cake",
          description: "Decadent warm chocolate cake with a molten chocolate center.",
          mrp: 199,
          price: 149,
          image: "http://localhost:3001/foods/cake.jpeg",
          arModelPath: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
          categoryId: catBeverages._id,
          restaurantId: restaurant1._id,
          status: ProductStatus.ACTIVE,
          stock: 20,
          isVegetarian: true,
          isAvailable: true,
          preparationTime: 8,
        }
      ]);

      // Create Products for Restaurant 2 (Burger & Co.)
      await Product.create([
        {
          title: "Classic Cheeseburger",
          description: "Flame-grilled beef patty, melted cheddar cheese, lettuce, tomato, pickles, and our signature burger sauce on a brioche bun.",
          mrp: 299,
          price: 249,
          image: "http://localhost:3001/foods/burger.jpg",
          arModelPath: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
          categoryId: catBurgers._id,
          restaurantId: restaurant2._id,
          status: ProductStatus.ACTIVE,
          stock: 60,
          isVegetarian: false,
          isAvailable: true,
          preparationTime: 10,
        },
        {
          title: "Fresh Garden Salad",
          description: "A refreshing mix of organic greens, cherry tomatoes, cucumbers, carrots, and balsamic vinaigrette dressing.",
          mrp: 249,
          price: 199,
          image: "http://localhost:3001/foods/salad.jpg",
          categoryId: catSides._id,
          restaurantId: restaurant2._id,
          status: ProductStatus.ACTIVE,
          stock: 30,
          isVegetarian: true,
          isAvailable: true,
          preparationTime: 5,
        },
        {
          title: "Grilled Sirloin Steak",
          description: "Juicy flame-grilled sirloin steak served with roasted seasonal vegetables and pepper sauce.",
          mrp: 899,
          price: 699,
          image: "http://localhost:3001/foods/grilled-steak.jpg",
          categoryId: catSides._id,
          restaurantId: restaurant2._id,
          status: ProductStatus.ACTIVE,
          stock: 15,
          isVegetarian: false,
          isAvailable: true,
          preparationTime: 20,
        }
      ]);

      console.log("✅ Food vertical seeding completed successfully!");
    } else {
      console.log("ℹ️ Food vertical database already has restaurants. Skipping food seeding.");
    }

    /* ──────────────────────────────────────────────────────────
       2. SEED FURNITURE VERTICAL (IF EMPTY)
       ────────────────────────────────────────────────────────── */
    const furnitureStoreCount = await FurnitureStore.countDocuments();
    if (furnitureStoreCount === 0) {
      console.log("🌱 Seeding database with dummy furniture stores, categories, and products...");

      // Create Furniture Showroom 1: Nordic Living Showroom
      const store1 = await FurnitureStore.create({
        storeName: "Nordic Living Showroom",
        ownerName: "Sven Johansson",
        email: "hello@nordicliving.com",
        phone: "9876543212",
        password: "password123",
        address: "101 Scandinavian Boulevard, Design District",
        status: AccountStatus.ACTIVE,
        isEmailVerified: true,
      });

      // Create Furniture Showroom 2: Deco & Craft Studio
      const store2 = await FurnitureStore.create({
        storeName: "Deco & Craft Studio",
        ownerName: "Clara Vance",
        email: "clara@decocraft.com",
        phone: "9876543213",
        password: "password123",
        address: "302 Industrial Avenue, Creative Quarter",
        status: AccountStatus.ACTIVE,
        isEmailVerified: true,
      });

      // Create Categories for Showroom 1
      const catLiving = await FurnitureCategory.create({
        name: "Living Room",
        description: "Elegant and comfortable furniture for your family area",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
        status: CategoryStatus.ACTIVE,
        storeId: store1._id,
      });

      const catOffice = await FurnitureCategory.create({
        name: "Office Space",
        description: "Productivity-boosting ergonomic furniture",
        image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80",
        status: CategoryStatus.ACTIVE,
        storeId: store1._id,
      });

      // Create Categories for Showroom 2
      const catDining = await FurnitureCategory.create({
        name: "Dining & Kitchen",
        description: "Sturdy and beautiful dining sets",
        image: "https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&w=600&q=80",
        status: CategoryStatus.ACTIVE,
        storeId: store2._id,
      });

      const catDecor = await FurnitureCategory.create({
        name: "Accent Chairs & Decor",
        description: "Handcrafted accessories to elevate your room",
        image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80",
        status: CategoryStatus.ACTIVE,
        storeId: store2._id,
      });

      // Create Products for Showroom 1 (Nordic Living Showroom)
      await FurnitureProduct.create([
        {
          title: "Minimalist Fabric Sofa",
          description: "Ergonomically designed 3-seater sofa upholstered in premium breathable linen fabric. Features solid oak legs and pocket spring support for absolute comfort.",
          mrp: 24999,
          price: 19999,
          image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
          arModelPath: "https://modelviewer.dev/shared-assets/models/Chair.glb", // Official High-quality Chair 3D asset
          categoryId: catLiving._id,
          storeId: store1._id,
          status: ProductStatus.ACTIVE,
          stock: 12,
          isAvailable: true,
          dimensions: {
            height: "85 cm",
            width: "210 cm",
            depth: "90 cm"
          },
          material: "Premium Linen Fabric & Solid Oak"
        },
        {
          title: "Ergonomic Office Chair",
          description: "High-back mesh task chair with fully adjustable lumbar support, 3D padded armrests, and synchro-tilt mechanism. Perfect for long work-from-home sessions.",
          mrp: 12999,
          price: 9999,
          image: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=600&q=80",
          arModelPath: "https://modelviewer.dev/shared-assets/models/Chair.glb",
          categoryId: catOffice._id,
          storeId: store1._id,
          status: ProductStatus.ACTIVE,
          stock: 25,
          isAvailable: true,
          dimensions: {
            height: "120 cm",
            width: "65 cm",
            depth: "65 cm"
          },
          material: "Industrial Nylon Mesh & Aluminum Alloy"
        }
      ]);

      // Create Products for Showroom 2 (Deco & Craft Studio)
      await FurnitureProduct.create([
        {
          title: "Rustic Wooden Dining Table",
          description: "Stunning handcrafted solid pine wood dining table with an organic distressed finish and heavy-duty industrial carbon steel legs. Comfortably seats up to 6 people.",
          mrp: 18999,
          price: 14999,
          image: "https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&w=600&q=80",
          arModelPath: "https://modelviewer.dev/shared-assets/models/Chair.glb",
          categoryId: catDining._id,
          storeId: store2._id,
          status: ProductStatus.ACTIVE,
          stock: 8,
          isAvailable: true,
          dimensions: {
            height: "76 cm",
            width: "160 cm",
            depth: "90 cm"
          },
          material: "Solid Scandinavian Pine & Carbon Steel"
        },
        {
          title: "Minimalist Dining Chair",
          description: "Sleek and robust molded dining chair featuring a walnut veneer backrest and powder-coated matte black steel legs.",
          mrp: 4999,
          price: 3999,
          image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80",
          arModelPath: "https://modelviewer.dev/shared-assets/models/Chair.glb",
          categoryId: catDecor._id,
          storeId: store2._id,
          status: ProductStatus.ACTIVE,
          stock: 30,
          isAvailable: true,
          dimensions: {
            height: "82 cm",
            width: "45 cm",
            depth: "50 cm"
          },
          material: "Walnut Veneer & Matte Black Steel"
        }
      ]);

      console.log("✅ Furniture vertical seeding completed successfully!");
    } else {
      console.log("ℹ️ Furniture vertical database already has stores. Skipping furniture seeding.");
    }

    /* ──────────────────────────────────────────────────────────
       3. SEED DEFAULT ADMIN ACCOUNT (IF EMPTY)
       ────────────────────────────────────────────────────────── */
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log("🌱 Seeding default admin account...");
      await Admin.create({
        name: "System Administrator",
        email: "admin@realityloops.com",
        phone: "9876543210",
        password: "password123",
        status: AccountStatus.ACTIVE,
        isEmailVerified: true,
        permissions: ["ALL"],
      });
      console.log("✅ Seeded default admin account (admin@realityloops.com / password123)");
    }

  } catch (error) {
    console.error("❌ Seeding database failed:", error);
  }
}
