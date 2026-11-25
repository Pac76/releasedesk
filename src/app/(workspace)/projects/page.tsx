import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  createProjectAction,
  deleteProjectAction,
  updateProjectAction,
} from "@/app/projects/actions";
import { ProjectForm } from "@/components/projects/project-form";
import { ProjectList } from "@/components/projects/project-list";
import { getVerifiedAuth } from "@/lib/auth/verified-user";

export const metadata: Metadata = {
  title: "Proyectos",
};

export default async function ProjectsPage() {
  const auth = await getVerifiedAuth();
  if (!auth) {
    redirect("/login?next=%2Fprojects");
  }

  const { data: projects, error } = await auth.supabase
    .from("projects")
    .select("id, name, description, target_date, created_at")
    .eq("owner_id", auth.userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Projects could not be loaded.");
  }

  return (
    <main className="projects-content">
      <header className="projects-heading">
        <div>
          <p className="eyebrow eyebrow-dark">Inventario de entregas</p>
          <h1>Proyectos con un objetivo claro.</h1>
        </div>
        <p>
          Cada proyecto reúne el contexto y la fecha que guían una entrega.
          Tus consultas y cambios están limitados a tu identidad verificada.
        </p>
      </header>

      <section className="project-create" aria-labelledby="create-project-title">
        <div className="project-create-copy">
          <span aria-hidden="true">Nuevo</span>
          <h2 id="create-project-title">Prepará otra entrega</h2>
          <p>
            Empezá por el resultado esperado. El trabajo concreto se suma en
            el siguiente paso.
          </p>
        </div>
        <ProjectForm action={createProjectAction} variant="create" />
      </section>

      <ProjectList
        deleteAction={deleteProjectAction}
        projects={projects ?? []}
        updateAction={updateProjectAction}
      />
    </main>
  );
}
