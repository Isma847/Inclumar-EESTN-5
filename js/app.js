import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const supabaseUrl = "https://TU_URL.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5a3docnZ1YmJodXFoZW13bmx4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk0MDcyNiwiZXhwIjoyMDcwNTE2NzI2fQ.ofmzvx0fEts3n0nBThCr7EnnexdRKqBDbSjYAF7xvjw";
const supabase = createClient(supabaseUrl, supabaseKey);

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({ error: "Credenciales incorrectas." });
    }

    const userAuth = authData.user;

    const { data: usuarioExtra, error: userError } = await supabase
      .from("Usuarios")
      .select("*")
      .eq("id_auth", userAuth.id)
      .maybeSingle();

    if (userError) {
      return res.status(500).json({ error: "Error al buscar datos del usuario." });
    }

    if (!usuarioExtra) {
      return res.status(404).json({ error: "No se encontró información extra del usuario." });
    }

    res.json({
      message: "Login exitoso",
      user: userAuth,
      extra: usuarioExtra,
    });

  } catch (e) {
    res.status(500).json({ error: "Error interno en el servidor." });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
