import { prisma } from "@/lib/prisma";
import { seedDefaultCategories } from "@/lib/seed-categories";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    const eventType = evt.type;

    // User created
    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name } = evt.data;

      await prisma.user.create({
        data: {
          id,
          email: email_addresses[0].email_address,
          name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
        },
      });

      console.log(`Created user ${id} in database`);

      try {
        // Default for new users
        await seedDefaultCategories(id);
        console.log(`Seeded default categories for user ${id}`);
      } catch (seedError) {
        console.error(`Failed to seed categories for user ${id}:`, seedError);
      }
    }

    // User deleted
    if (eventType === "user.deleted") {
      const { id } = evt.data;

      if (id) {
        await prisma.user.delete({ where: { id } });
        console.log(`Deleted user ${id} from database`);
      }
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
