import { getUserById } from "@/lib/db/models/user";
import { getCurrentAdmin } from "@/lib/auth/jwt";
import { notFound } from "next/navigation";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    notFound();
  }

  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  const pdfUrl = `/downloads/cv/${id}`;

  return (
    <div className="w-full h-screen">
      <iframe
        src={pdfUrl}
        className="w-full h-full"
        style={{ border: "none" }}
        title={`CV ${user.fullName}`}
      />
    </div>
  );
}
