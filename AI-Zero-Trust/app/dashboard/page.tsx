import { getServerSession } from "next-auth"

import { handler } from "../api/auth/[...nextauth]/route";
import {redirect} from "next/navigation";
import Dashboard from "./DashBoard";
export default async function DashboardPage() {
  // const session = await getServerSession(handler);

  // if (!session) {
  //   redirect("/auth/sign-in");
  // }

  return (
    <Dashboard/>
  );
}

