import type { NextRequest } from "next/server";
import { currentAdmin } from "@/lib/auth/guard";
import { json, unauthorized } from "@/lib/http";

// Returns the current admin identity, resolved strictly from the admin session
// cookie (oams_admin_session). A normal storefront session returns 401 here.
export async function GET(request: NextRequest) {
  const user = await currentAdmin(request);
  if (!user) return unauthorized();
  return json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role, sellerStatus: user.sellerStatus },
  });
}

export const dynamic = "force-dynamic";