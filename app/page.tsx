import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function Home() {
  const authDisabled = process.env.DISABLE_AUTH === "true";
  const user = await getSessionUser();
  redirect(authDisabled || user ? "/dashboard" : "/login");
}
