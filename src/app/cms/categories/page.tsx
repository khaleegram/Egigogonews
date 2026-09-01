import {
  createCategory,
  listCategoriesAdmin,
  toggleCategoryActive,
  updateCategory,
} from "@/lib/category-actions";
import { requireCmsPage } from "@/lib/cms-auth";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await requireCmsPage(["admin"]);
  const rows = await listCategoriesAdmin();

  async function createAction(formData: FormData) {
    "use server";
    await createCategory({
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? "") || undefined,
      description: String(formData.get("description") ?? ""),
      sortOrder: Number(formData.get("sortOrder") ?? 99),
    });
  }

  return (
    <>
      <h1>Categories</h1>
      <form action={createAction} className="auth-form" style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontFamily: "var(--font-display), Georgia, serif" }}>Add category</h2>
        <label>
          Name
          <input name="name" required />
        </label>
        <label>
          Slug (optional)
          <input name="slug" />
        </label>
        <label>
          Description
          <input name="description" />
        </label>
        <label>
          Sort
          <input name="sortOrder" type="number" defaultValue={99} />
        </label>
        <button type="submit" className="btn">
          Add category
        </button>
      </form>

      <div className="cms-table-wrap"><table className="cms-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th>Sort</th>
            <th>Active</th>
            <th>Save</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id}>
              <td colSpan={5} style={{ padding: 0 }}>
                <form
                  action={async (fd) => {
                    "use server";
                    await updateCategory({
                      id: c.id,
                      name: String(fd.get("name") ?? ""),
                      slug: String(fd.get("slug") ?? ""),
                      description: String(fd.get("description") ?? ""),
                      sortOrder: Number(fd.get("sortOrder") ?? 0),
                      active: fd.get("active") === "on",
                    });
                  }}
                  className="cms-inline-form"
                >
                  <input name="name" defaultValue={c.name} required />
                  <input name="slug" defaultValue={c.slug} required />
                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue={c.sortOrder}
                  />
                  <label style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                    <input
                      name="active"
                      type="checkbox"
                      defaultChecked={c.active}
                    />
                    on
                  </label>
                  <button type="submit" className="btn btn--ghost">
                    Save
                  </button>
                  <input type="hidden" name="description" value={c.description ?? ""} />
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </>
  );
}
