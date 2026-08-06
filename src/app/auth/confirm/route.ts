import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const tokenHash = formData.get("token_hash");
  const type = formData.get("type");

  if (typeof tokenHash === "string" && tokenHash && type === "recovery") {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery",
    });

    if (!error) {
      return NextResponse.redirect(new URL("/wachtwoord-wijzigen", request.url), 303);
    }
  }

  const errorUrl = new URL("/inloggen", request.url);
  errorUrl.searchParams.set("fout", "De herstellink is ongeldig of verlopen. Vraag een nieuwe link aan.");
  return NextResponse.redirect(errorUrl, 303);
}
