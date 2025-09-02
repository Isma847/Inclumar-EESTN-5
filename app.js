import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.static("."));

const supabaseUrl = "https://vykwhrvubbhuqhemwnlx.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5a3docnZ1YmJodXFoZW13bmx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NDA3MjYsImV4cCI6MjA3MDUxNjcyNn0.NvoIcBnEJsY2MFTlz_yjd_Ns84SzjlsLqzS99YvZx8c";

const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey);

const supabaseDB = createClient(supabaseUrl, supabaseServiceKey);

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      error: "Todos los campos son obligatorios",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: "La contraseña debe tener al menos 6 caracteres",
    });
  }

  try {
    const { data: authData, error: authError } = await supabaseAuth.auth.signUp(
      {
        email,
        password,
        options: {
          emailRedirectTo: undefined,
        },
      }
    );

    if (authError) {
      console.error("Error en auth.signUp:", authError);
      return res.status(400).json({
        error: authError.message.includes("already registered")
          ? "Este email ya está registrado"
          : "Error al crear la cuenta: " + authError.message,
      });
    }

    const userAuth = authData.user;

    if (!userAuth) {
      return res.status(400).json({
        error: "No se pudo crear el usuario",
      });
    }

    console.log("Usuario creado en Auth:", {
      id: userAuth.id,
      email: userAuth.email,
      created_at: userAuth.created_at,
    });

    const { data: usuarioExtra, error: userError } = await supabaseDB
      .from("Usuarios")
      .insert([
        {
          id_auth: userAuth.id,
          nombre: username,
        },
      ])
      .select()
      .single();

    console.log("Intento insertar en Usuarios:", {
      id_auth: userAuth.id,
      nombre: username,
    });

    if (userError) {
      console.error("Error al crear registro en Usuarios:", userError);

      try {
        await supabaseAuth.auth.admin.deleteUser(userAuth.id);
      } catch (cleanupError) {
        console.error("Error al limpiar usuario:", cleanupError);
      }

      return res.status(500).json({
        error: "Error al guardar información del usuario: " + userError.message,
      });
    }

    res.json({
      message: "Cuenta creada correctamente",
      user: {
        id: userAuth.id,
        email: userAuth.email,
        nombre: usuarioExtra.nombre,
      },
    });
  } catch (e) {
    console.error("Error interno en signup:", e);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Intento de login para:", email);

    const { data: authData, error: authError } =
      await supabaseAuth.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      console.error("Error en signInWithPassword:", authError.message);
      return res.status(400).json({ error: "Credenciales incorrectas." });
    }

    const userAuth = authData.user;
    console.log("Usuario autenticado:", {
      id: userAuth.id,
      email: userAuth.email,
    });

    const { data: usuarioExtra, error: userError } = await supabaseDB
      .from("Usuarios")
      .select("*")
      .eq("id_auth", userAuth.id)
      .maybeSingle();

    console.log("Búsqueda en tabla Usuarios con id_auth:", userAuth.id);
    console.log("Resultado de búsqueda:", usuarioExtra);

    if (userError) {
      console.error("Error al buscar en tabla Usuarios:", userError);
      return res
        .status(500)
        .json({ error: "Error al buscar datos del usuario." });
    }

    if (!usuarioExtra) {
      console.error(
        "No se encontró usuario en tabla Usuarios para id_auth:",
        userAuth.id
      );
      return res
        .status(404)
        .json({ error: "No se encontró información extra del usuario." });
    }

    console.log("Login exitoso para:", usuarioExtra.nombre);

    res.json({
      message: "Login exitoso",
      user: userAuth,
      extra: usuarioExtra,
    });
  } catch (e) {
    console.error("Error interno en login:", e);
    res.status(500).json({ error: "Error interno en el servidor." });
  }
});

app.get("/debug/usuarios", async (req, res) => {
  try {
    const { data: authUsers, error: authError } =
      await supabaseAuth.auth.admin.listUsers();

    const { data: usuariosTabla, error: usuariosError } = await supabaseDB
      .from("Usuarios")
      .select("*");

    res.json({
      message: "Debug info",
      auth_users: authUsers?.users || [],
      usuarios_tabla: usuariosTabla || [],
      errors: {
        auth_error: authError,
        usuarios_error: usuariosError,
      },
    });
  } catch (e) {
    console.error("Error en debug:", e);
    res.status(500).json({ error: "Error en debug" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
