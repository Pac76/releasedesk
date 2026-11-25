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
import { localize } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: localize(locale, { en: "Projects", es: "Proyectos" }) };
}

export default async function ProjectsPage() {
  const [locale, auth] = await Promise.all([getLocale(), getVerifiedAuth()]);
  const copy = localize(locale, {
    en: {
      createDescription: "Start with the expected outcome. Add concrete work in the next step.",
      createHeading: "Prepare another release",
      description: "Each project brings together the context and date that guide a release. Your queries and changes are restricted to your verified identity.",
      heading: "Projects with a clear goal.",
      kicker: "Release inventory",
      newLabel: "New",
    },
    es: {
      createDescription: "Empezá por el resultado esperado. El trabajo concreto se suma en el siguiente paso.",
      createHeading: "Prepará otra entrega",
      description: "Cada proyecto reúne el contexto y la fecha que guían una entrega. Tus consultas y cambios están limitados a tu identidad verificada.",
      heading: "Proyectos con un objetivo claro.",
      kicker: "Inventario de entregas",
      newLabel: "Nuevo",
    },
  });
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
          <p className="eyebrow eyebrow-dark">{copy.kicker}</p>
          <h1>{copy.heading}</h1>
        </div>
        <p>{copy.description}</p>
      </header>

      <section className="project-create" aria-labelledby="create-project-title">
        <div className="project-create-copy">
          <span aria-hidden="true">{copy.newLabel}</span>
          <h2 id="create-project-title">{copy.createHeading}</h2>
          <p>{copy.createDescription}</p>
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
