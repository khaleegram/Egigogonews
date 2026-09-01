import {
  createUser,
  listUsers,
  setUserActive,
  setUserRole,
} from "@/lib/user-actions";
import { getStaff } from "@/lib/cms-auth";
import { formatPublishedLabel } from "@/lib/story";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const staff = await getStaff();
  const users = await listUsers();

  async function createAction(formData: FormData) {
    "use server";
    await createUser({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      role: String(formData.get("role") ?? "reporter") as
        | "admin"
        | "editor"
        | "reporter",
      password: String(formData.get("password") ?? ""),
    });
  }

  return (
    <>
      <h1>Users</h1>
      <form action={createAction} className="auth-form" style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontFamily: "var(--font-display), Georgia, serif" }}>Add user</h2>
        <label>
          Name
          <input name="name" required />
        </label>
        <label>
          Email
          <input name="email" type="email" required />
        </label>
        <label>
          Role
          <select name="role" defaultValue="reporter">
            <option value="reporter">reporter</option>
            <option value="editor">editor</option>
            <option value="admin">admin</option>
          </select>
        </label>
        <label>
          Temporary password
          <input name="password" type="password" required minLength={8} />
        </label>
        <button type="submit" className="btn">
          Create user
        </button>
      </form>

      <div className="cms-table-wrap"><table className="cms-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Active</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <form
                  action={async (fd) => {
                    "use server";
                    await setUserRole(
                      u.id,
                      String(fd.get("role")) as "admin" | "editor" | "reporter",
                    );
                  }}
                  style={{ display: "flex", gap: "0.35rem" }}
                >
                  <select name="role" defaultValue={u.role}>
                    <option value="reporter">reporter</option>
                    <option value="editor">editor</option>
                    <option value="admin">admin</option>
                  </select>
                  <button type="submit" className="btn btn--ghost">
                    Save
                  </button>
                </form>
              </td>
              <td>{u.active ? "yes" : "no"}</td>
              <td>{formatPublishedLabel(u.createdAt)}</td>
              <td>
                {staff?.id === u.id ? (
                  "—"
                ) : (
                  <form
                    action={async () => {
                      "use server";
                      await setUserActive(u.id, !u.active);
                    }}
                  >
                    <button type="submit" className="btn btn--ghost">
                      {u.active ? "Disable" : "Enable"}
                    </button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </>
  );
}
