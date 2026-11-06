"use server";

// Acciones del panel. Cada una es un punto de entrada público, así que todas parten verificando
// la sesión (exigirUsuario). Next.js además rechaza las que no vienen de este mismo sitio.

import { redirect } from "next/navigation";
import { cerrarOtrasSesiones, cerrarSesion, exigirUsuario } from "@/lib/admin/auth";
import { CLAVE_MINIMA, hashClave, verificarClave } from "@/lib/admin/clave";
import { partesIguales } from "@/lib/admin/consultas";
import { db } from "@/lib/admin/db";
import {
  type CodigoError,
  decimalDe,
  ErrorDeDatos,
  fechaDe,
  hoy,
  idDe,
  opcional,
  opcionDe,
  pesosDe,
  sumarMeses,
  texto,
} from "@/lib/admin/formato";
import { categoriasGasto, ciclos, claves, estadosProyecto, mesesPorCiclo, monedas } from "@/lib/admin/opciones";
import { nombreMes } from "@/lib/admin/formato";

// Lee y valida el formulario; si algo no cuadra, vuelve al formulario con el mensaje
function validar<T>(leer: () => T, volver: string): T {
  try {
    return leer();
  } catch (error) {
    if (error instanceof ErrorDeDatos) volverCon(volver, error.codigo);
    throw error;
  }
}

function volverCon(ruta: string, codigo: CodigoError): never {
  redirect(`${ruta}?error=${codigo}`);
}

// Un usuario existente, o null (cuenta de la empresa)
async function usuarioODelaEmpresa(id: number | null) {
  if (id === null) return null;
  const [fila] = await db()`select id from usuarios where id = ${id}`;
  return fila ? id : null;
}

// Pago que llegó dividido entre varias cuentas (componente CampoRecibido). Null = llegó a una sola.
async function leerDivision(fd: FormData, monto: number, volver: string) {
  if (fd.get("recibido_por") !== "dividido") return null;
  const usuarios = await db()<{ id: number }[]>`select id from usuarios order by id`;
  const detalle: Record<string, number> = {};
  for (const clave of [...usuarios.map((u) => String(u.id)), "empresa"]) {
    const valor = String(fd.get(`recibido_${clave}`) ?? "").replace(/[$\s.]/g, "");
    if (valor && !/^\d{1,10}$/.test(valor)) volverCon(volver, "monto");
    if (Number(valor) > 0) detalle[clave] = Number(valor);
  }
  if (Object.values(detalle).reduce((a, b) => a + b, 0) !== monto) volverCon(volver, "division");
  return detalle;
}

// Cuánto es para cada socio (ingreso) o cuánto pone cada uno (gasto), en pesos (componente CampoPara).
// Debe sumar el monto total. Si queda mitad y mitad se guarda vacío.
async function leerPartes(fd: FormData, prefijo: string, monto: number, volver: string) {
  const usuarios = await db()<{ id: number }[]>`select id from usuarios order by id`;
  // Formularios sin estos campos (ej. registro rápido de mantención): mitad y mitad
  if (usuarios.length < 2 || usuarios.every((u) => fd.get(`${prefijo}${u.id}`) === null)) return null;
  const partes: Record<string, number> = {};
  for (const u of usuarios) {
    const valor = String(fd.get(`${prefijo}${u.id}`) ?? "").replace(/[$\s.]/g, "");
    if (valor && !/^\d{1,10}$/.test(valor)) volverCon(volver, "monto");
    partes[String(u.id)] = Number(valor) || 0;
  }
  if (Object.values(partes).reduce((a, b) => a + b, 0) !== monto) volverCon(volver, "partes");
  const iguales = partesIguales(monto, usuarios);
  return usuarios.every((u) => iguales[String(u.id)] === partes[String(u.id)]) ? null : partes;
}

const mesValido = (v: FormDataEntryValue | null) => (typeof v === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(v) ? v : null);

// ---------------- Sesión ----------------

export async function salir() {
  await cerrarSesion();
  redirect("/admin/login");
}

// ---------------- Clientes ----------------

export async function guardarCliente(fd: FormData) {
  await exigirUsuario();
  const id = idDe(fd, "id");
  const datos = validar(
    () => ({
      nombre: texto(fd, "nombre", 120, true),
      contacto: texto(fd, "contacto", 120, true),
      email: opcional(fd, "email", 200),
      telefono: texto(fd, "telefono", 40, true),
      rut: opcional(fd, "rut", 20),
      notas: opcional(fd, "notas", 4000),
    }),
    `/admin/clientes/${id ?? "nuevo"}`,
  );
  const sql = db();
  if (id) await sql`update clientes set ${sql(datos)} where id = ${id}`;
  else await sql`insert into clientes ${sql(datos)}`;
  redirect("/admin/clientes?ok=guardado");
}

export async function eliminarCliente(fd: FormData) {
  await exigirUsuario();
  const id = idDe(fd, "id");
  if (id) await db()`delete from clientes where id = ${id}`;
  redirect("/admin/clientes?ok=eliminado");
}

// ---------------- Proyectos ----------------

export async function guardarProyecto(fd: FormData) {
  await exigirUsuario();
  const id = idDe(fd, "id");
  const datos = validar(
    () => ({
      nombre: texto(fd, "nombre", 120, true),
      cliente_id: idDe(fd, "cliente_id"),
      estado: opcionDe(fd, "estado", claves(estadosProyecto), "en_curso"),
      monto: pesosDe(fd, "monto"),
      inicio: fechaDe(fd, "inicio", false),
      entrega: fechaDe(fd, "entrega", false),
      notas: opcional(fd, "notas", 4000),
      mant_activa: fd.get("mant_activa") === "on",
      mant_monto: String(fd.get("mant_monto") ?? "").trim() ? pesosDe(fd, "mant_monto") : 0,
      mant_dia: Math.min(28, Math.max(1, Math.round(Number(fd.get("mant_dia")) || 5))),
      mant_desde: fechaDe(fd, "mant_desde", false),
    }),
    `/admin/proyectos/${id ?? "nuevo"}`,
  );
  const sql = db();
  const fila = datos;
  if (id) {
    await sql`update proyectos set ${sql(fila)} where id = ${id}`;
    redirect(`/admin/proyectos/${id}?ok=guardado`);
  }
  const [nuevo] = await sql<{ id: number }[]>`insert into proyectos ${sql(fila)} returning id`;
  redirect(`/admin/proyectos/${nuevo.id}?ok=guardado`);
}

export async function eliminarProyecto(fd: FormData) {
  await exigirUsuario();
  const id = idDe(fd, "id");
  if (id) await db()`delete from proyectos where id = ${id}`;
  redirect("/admin/proyectos?ok=eliminado");
}

// ---------------- Ingresos ----------------

export async function guardarIngreso(fd: FormData) {
  await exigirUsuario();
  const id = idDe(fd, "id");
  const datos = validar(
    () => ({
      fecha: fechaDe(fd, "fecha")!,
      descripcion: texto(fd, "descripcion", 200, true),
      monto: pesosDe(fd, "monto", 1),
      proyecto_id: idDe(fd, "proyecto_id"),
      recibido_por: idDe(fd, "recibido_por"),
      notas: opcional(fd, "notas", 2000),
    }),
    `/admin/ingresos/${id ?? "nuevo"}`,
  );
  datos.recibido_por = await usuarioODelaEmpresa(datos.recibido_por);
  const recibido_detalle = await leerDivision(fd, datos.monto, `/admin/ingresos/${id ?? "nuevo"}`);
  if (recibido_detalle) datos.recibido_por = null;
  const para = await leerPartes(fd, "para_", datos.monto, `/admin/ingresos/${id ?? "nuevo"}`);
  const mant_mes = datos.proyecto_id ? mesValido(fd.get("mant_mes")) : null;
  const sql = db();
  const fila = { ...datos, mant_mes, para: para ? sql.json(para) : null, recibido_detalle: recibido_detalle ? sql.json(recibido_detalle) : null };
  try {
    if (id) await sql`update ingresos set ${sql(fila)} where id = ${id}`;
    else await sql`insert into ingresos ${sql(fila)}`;
  } catch (error) {
    if ((error as { code?: string }).code === "23505") volverCon(`/admin/ingresos/${id ?? "nuevo"}`, "mantencionRepetida");
    throw error;
  }
  redirect(`/admin/ingresos?mes=${datos.fecha.slice(0, 7)}&ok=guardado`);
}

export async function eliminarIngreso(fd: FormData) {
  await exigirUsuario();
  const id = idDe(fd, "id");
  if (id) await db()`delete from ingresos where id = ${id}`;
  redirect("/admin/ingresos?ok=eliminado");
}

// ---------------- Gastos ----------------

export async function guardarGasto(fd: FormData) {
  await exigirUsuario();
  const id = idDe(fd, "id");
  const datos = validar(
    () => ({
      fecha: fechaDe(fd, "fecha")!,
      descripcion: texto(fd, "descripcion", 200, true),
      categoria: opcionDe(fd, "categoria", claves(categoriasGasto), "otros"),
      monto: pesosDe(fd, "monto", 1),
      pagado_por: idDe(fd, "pagado_por"),
      proyecto_id: idDe(fd, "proyecto_id"),
      servicio_id: idDe(fd, "servicio_id"),
      proveedor: opcional(fd, "proveedor", 120),
      documento: opcional(fd, "documento", 60),
      notas: opcional(fd, "notas", 2000),
    }),
    `/admin/gastos/${id ?? "nuevo"}`,
  );
  datos.pagado_por = await usuarioODelaEmpresa(datos.pagado_por);
  const pone = await leerPartes(fd, "pone_", datos.monto, `/admin/gastos/${id ?? "nuevo"}`);
  const sql = db();
  const fila = { ...datos, pone: pone ? sql.json(pone) : null };
  if (id) await sql`update gastos set ${sql(fila)} where id = ${id}`;
  else await sql`insert into gastos ${sql(fila)}`;
  redirect(`/admin/gastos?mes=${datos.fecha.slice(0, 7)}&ok=guardado`);
}

export async function eliminarGasto(fd: FormData) {
  await exigirUsuario();
  const id = idDe(fd, "id");
  if (id) await db()`delete from gastos where id = ${id}`;
  redirect("/admin/gastos?ok=eliminado");
}

// ---------------- Servicios contratados ----------------

export async function guardarServicio(fd: FormData) {
  await exigirUsuario();
  const id = idDe(fd, "id");
  const datos = validar(
    () => ({
      nombre: texto(fd, "nombre", 120, true),
      proveedor: opcional(fd, "proveedor", 120),
      categoria: opcionDe(fd, "categoria", claves(categoriasGasto), "otros"),
      moneda: opcionDe(fd, "moneda", monedas, "CLP"),
      costo: decimalDe(fd, "costo"),
      ciclo: opcionDe(fd, "ciclo", claves(ciclos), "mensual"),
      proximo_cobro: fechaDe(fd, "proximo_cobro", false),
      pagado_por: idDe(fd, "pagado_por"),
      proyecto_id: idDe(fd, "proyecto_id"),
      activo: fd.get("activo") === "on",
      avisar_dias: Math.min(60, Math.max(0, Number(String(fd.get("avisar_dias") ?? "5")) || 0)),
      notas: opcional(fd, "notas", 2000),
    }),
    `/admin/servicios/${id ?? "nuevo"}`,
  );
  if (datos.moneda === "CLP") datos.costo = Math.round(datos.costo);
  datos.pagado_por = await usuarioODelaEmpresa(datos.pagado_por);
  const sql = db();
  if (id) await sql`update servicios set ${sql(datos)} where id = ${id}`;
  else await sql`insert into servicios ${sql(datos)}`;
  redirect("/admin/servicios?ok=guardado");
}

export async function eliminarServicio(fd: FormData) {
  await exigirUsuario();
  const id = idDe(fd, "id");
  if (id) await db()`delete from servicios where id = ${id}`;
  redirect("/admin/servicios?ok=eliminado");
}

// Registra el cobro del período como gasto y adelanta la próxima fecha según el ciclo
export async function registrarPagoServicio(fd: FormData) {
  await exigirUsuario();
  const id = idDe(fd, "id");
  if (!id) redirect("/admin/servicios");
  const montoPesos = validar(() => pesosDe(fd, "monto", 1), "/admin/servicios");
  const fechaPago = validar(() => fechaDe(fd, "fecha", false), "/admin/servicios") ?? hoy();

  const sql = db();
  await sql.begin(async (tx) => {
    const [s] = await tx<{ nombre: string; proveedor: string | null; categoria: string; ciclo: keyof typeof mesesPorCiclo; proximo_cobro: string | null; pagado_por: number | null; proyecto_id: number | null }[]>`
      select nombre, proveedor, categoria, ciclo, proximo_cobro, pagado_por, proyecto_id from servicios where id = ${id} for update`;
    if (!s) return;
    await tx`insert into gastos (fecha, descripcion, categoria, monto, pagado_por, proyecto_id, servicio_id, proveedor)
      values (${fechaPago}, ${s.nombre}, ${s.categoria}, ${montoPesos}, ${s.pagado_por}, ${s.proyecto_id}, ${id}, ${s.proveedor})`;
    const meses = mesesPorCiclo[s.ciclo];
    if (meses === 0) await tx`update servicios set activo = false, proximo_cobro = null where id = ${id}`;
    else await tx`update servicios set proximo_cobro = ${sumarMeses(s.proximo_cobro ?? fechaPago, meses)} where id = ${id}`;
  });
  redirect("/admin/servicios?ok=pago");
}

// ---------------- Mantención mensual ----------------

// Registra el pago de la mantención de un mes como ingreso del proyecto
export async function registrarMantencion(fd: FormData) {
  await exigirUsuario();
  const id = idDe(fd, "proyecto_id");
  const mes = mesValido(fd.get("mes"));
  const volver = String(fd.get("volver") ?? "") === "proyecto" && id ? `/admin/proyectos/${id}` : "/admin/mantenciones";
  if (!id || !mes) volverCon(volver, "faltan");
  const monto = validar(() => pesosDe(fd, "monto", 1), volver);
  const fecha = validar(() => fechaDe(fd, "fecha", false), volver) ?? hoy();
  const dividido = await leerDivision(fd, monto, volver);
  const recibido = dividido ? null : await usuarioODelaEmpresa(idDe(fd, "recibido_por"));
  const para = await leerPartes(fd, "para_", monto, volver);

  const sql = db();
  const [p] = await sql<{ nombre: string }[]>`select nombre from proyectos where id = ${id}`;
  if (!p) volverCon(volver, "faltan");
  try {
    await sql`insert into ingresos (fecha, descripcion, monto, proyecto_id, recibido_por, recibido_detalle, para, mant_mes)
      values (${fecha}, ${`Mantención ${nombreMes(mes)} · ${p.nombre}`}, ${monto}, ${id}, ${recibido}, ${dividido ? sql.json(dividido) : null}, ${para ? sql.json(para) : null}, ${mes})`;
  } catch (error) {
    if ((error as { code?: string }).code === "23505") volverCon(volver, "mantencionRepetida");
    throw error;
  }
  redirect(`${volver}?ok=mantencion`);
}

// ---------------- Transferencias entre socios ----------------

// Vuelve a la misma vista de Reparto (mes, año o todo) desde donde se envió el formulario
function rutaReparto(fd: FormData) {
  const q = String(fd.get("volver") ?? "");
  return /^(mes=\d{4}-(0[1-9]|1[0-2])|anio=\d{4}|todo=1)$/.test(q) ? `/admin/reparto?${q}` : "/admin/reparto";
}
const conAviso = (ruta: string, aviso: string) => `${ruta}${ruta.includes("?") ? "&" : "?"}${aviso}`;

export async function guardarTransferencia(fd: FormData) {
  await exigirUsuario();
  const volver = rutaReparto(fd);
  const leer = (campo: string) => (fd.get(campo) === "empresa" ? null : idDe(fd, campo));
  try {
    const monto = pesosDe(fd, "monto", 1);
    const fecha = fechaDe(fd, "fecha", false) ?? hoy();
    const notas = opcional(fd, "notas", 300);
    const de = await usuarioODelaEmpresa(leer("de"));
    const a = await usuarioODelaEmpresa(leer("a"));
    if (de === a) throw new ErrorDeDatos("transferencia");
    await db()`insert into transferencias (fecha, de_usuario, a_usuario, monto, notas) values (${fecha}, ${de}, ${a}, ${monto}, ${notas})`;
  } catch (error) {
    if (error instanceof ErrorDeDatos) redirect(conAviso(volver, `error=${error.codigo}`));
    throw error;
  }
  redirect(conAviso(volver, "ok=transferencia"));
}

export async function eliminarTransferencia(fd: FormData) {
  await exigirUsuario();
  const id = idDe(fd, "id");
  if (id) await db()`delete from transferencias where id = ${id}`;
  redirect(conAviso(rutaReparto(fd), "ok=eliminado"));
}

// ---------------- Ajustes ----------------

export async function guardarAjustes(fd: FormData) {
  await exigirUsuario();
  const sql = db();
  const dolar = validar(() => pesosDe(fd, "dolar", 1), "/admin/ajustes");
  const usuarios = await sql<{ id: number }[]>`select id from usuarios order by id`;
  const nombres = usuarios.map((u) => ({ id: u.id, nombre: texto(fd, `nombre_${u.id}`, 80) || null })); // vacío = se mantiene
  await sql.begin(async (tx) => {
    await tx`insert into ajustes (clave, valor) values ('dolar', ${String(dolar)}) on conflict (clave) do update set valor = excluded.valor`;
    for (const u of nombres) await tx`update usuarios set nombre = coalesce(${u.nombre}, nombre) where id = ${u.id}`;
  });
  redirect("/admin/ajustes?ok=guardado");
}

export async function cambiarClave(fd: FormData) {
  const usuario = await exigirUsuario();
  const actual = String(fd.get("actual") ?? "");
  const nueva = String(fd.get("nueva") ?? "");
  const repetir = String(fd.get("repetir") ?? "");
  // Para cambiar la propia o fijar una temporal a la otra cuenta, se pide la contraseña propia
  const destino = idDe(fd, "usuario_id") ?? usuario.id;

  const sql = db();
  const [yo] = await sql<{ hash_clave: string }[]>`select hash_clave from usuarios where id = ${usuario.id}`;
  if (!yo || !(await verificarClave(actual, yo.hash_clave))) volverCon("/admin/ajustes", "clave");
  if (nueva.length < CLAVE_MINIMA || nueva.length > 200) volverCon("/admin/ajustes", "claveCorta");
  if (nueva !== repetir) volverCon("/admin/ajustes", "claveDistinta");

  await sql`update usuarios set hash_clave = ${await hashClave(nueva)}, intentos_fallidos = 0, bloqueado_hasta = null where id = ${destino}`;
  // Cambiar la clave cierra las demás sesiones de esa cuenta
  if (destino === usuario.id) await cerrarOtrasSesiones(usuario.id);
  else await sql`delete from sesiones where usuario_id = ${destino}`;
  redirect("/admin/ajustes?ok=clave");
}

export async function cerrarDemasSesiones() {
  const usuario = await exigirUsuario();
  await cerrarOtrasSesiones(usuario.id);
  redirect("/admin/ajustes?ok=sesiones");
}
