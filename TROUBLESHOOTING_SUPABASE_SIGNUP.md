# 🔧 Guía de Diagnóstico y Solución - Error de Registro Supabase

## 🚨 **Problema Reportado**
Error: "El email ya está en uso o los datos no son válidos" al intentar registrar usuarios con emails nuevos.

## 🔍 **Causas Más Comunes**

### 1. 🔐 **Configuración de Autenticación en Supabase**

#### ✅ **Verificar en Supabase Dashboard:**
```
Authentication > Settings > User Signups
```

**Configuraciones críticas:**
- ✅ **Enable email confirmations**: OFF (para testing) / ON (para producción)
- ✅ **Allow new users to sign up**: DEBE estar ON
- ✅ **Enable custom SMTP**: Verificar si está configurado correctamente
- ✅ **Site URL**: Debe incluir tu dominio/localhost

#### 🛠️ **Configuración Recomendada para Desarrollo:**
```
✅ Enable email confirmations: OFF
✅ Allow new users to sign up: ON  
✅ Enable phone confirmations: OFF
✅ Site URL: http://localhost:5173
```

### 2. 📧 **Problemas de Email**

#### **Causa A: Email ya existe en auth.users**
```sql
-- Verificar en SQL Editor de Supabase:
SELECT email, created_at, email_confirmed_at 
FROM auth.users 
WHERE email = 'usuario@example.com';
```

#### **Causa B: Email en formato incorrecto**
```typescript
// ❌ Problemático
email: "Usuario@Example.COM  "

// ✅ Correcto
email: "usuario@example.com"
```

#### **Solución:**
```typescript
// Normalizar email antes de enviar
const normalizedEmail = email.toLowerCase().trim();
```

### 3. 🔒 **Políticas RLS (Row Level Security)**

#### **Problema:** Políticas muy restrictivas en tabla `profiles`

```sql
-- Verificar políticas existentes:
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

#### **Política Correcta para Inserción:**
```sql
-- Permitir inserción de perfiles para usuarios autenticados
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### 4. 🔄 **Triggers de Base de Datos**

#### **Verificar si hay trigger que crea perfiles automáticamente:**
```sql
-- Ver triggers en tabla profiles
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'profiles';
```

#### **Trigger Recomendado:**
```sql
-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que ejecuta la función
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### 5. 📊 **Límites de Rate Limiting**

#### **Problema:** Demasiados intentos de registro
```typescript
// Verificar en Network tab del navegador:
// Status 429 = Rate limit exceeded
```

#### **Solución:**
- Esperar 1-2 minutos entre intentos
- Configurar rate limits en Supabase Dashboard

### 6. 🌐 **Variables de Entorno**

#### **Verificar configuración:**
```env
# .env - Verificar que estén correctas
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_publica
```

#### **Verificar en código:**
```typescript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

## 🛠️ **Plan de Diagnóstico Paso a Paso**

### **Paso 1: Verificar Logs Detallados**
Usa la función de registro mejorada que implementamos para ver logs detallados en la consola del navegador.

### **Paso 2: Verificar Configuración de Supabase**
```
1. Authentication > Settings
2. Verificar "Allow new users to sign up" = ON
3. Verificar "Enable email confirmations" según necesidad
4. Verificar Site URL incluye tu dominio
```

### **Paso 3: Probar con Email Fresco**
```typescript
// Usar un email completamente nuevo que nunca se haya usado
const testEmail = `test_${Date.now()}@example.com`;
```

### **Paso 4: Verificar en SQL Editor**
```sql
-- Ver si el email existe en auth.users
SELECT * FROM auth.users WHERE email = 'test@example.com';

-- Ver si existe en profiles
SELECT * FROM profiles WHERE email = 'test@example.com';
```

### **Paso 5: Verificar Políticas RLS**
```sql
-- Deshabilitar RLS temporalmente para testing
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Si funciona, el problema son las políticas
-- Recuerda volver a habilitar después:
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

## 🔧 **Soluciones Implementadas**

### **1. Manejo de Errores Mejorado**
- ✅ Logs detallados en consola
- ✅ Mensajes de error específicos
- ✅ Validación previa del lado del cliente

### **2. Validaciones Robustas**
```typescript
// Validaciones implementadas:
- Email formato válido
- Password mínimo 6 caracteres
- Nombre mínimo 2 caracteres
- Normalización de email (lowercase, trim)
```

### **3. Verificación Preventiva**
```typescript
// Verificar si email existe antes de intentar registro
const { data: existingUser } = await supabase
  .from('profiles')
  .select('email')
  .eq('email', email.toLowerCase())
  .single();
```

## 🧪 **Testing**

### **Probar con Email Nuevo:**
```typescript
const testEmail = `test_${Date.now()}@gmail.com`;
const testPassword = "123456";
const testName = "Usuario Test";
```

### **Verificar en Consola:**
```
🚀 Intentando registrar usuario: { email: "...", name: "..." }
🔍 Verificando si el email existe...
✅ Email no existe en profiles, procediendo con signUp...
📊 Resultado de signUp: { user: "Usuario creado", session: "...", error: "..." }
```

## 📋 **Checklist de Verificación**

- [ ] ✅ Configuración de Supabase permite registro
- [ ] ✅ Email es nuevo (no existe en auth.users ni profiles)
- [ ] ✅ Variables de entorno correctas
- [ ] ✅ Políticas RLS permiten inserción
- [ ] ✅ No hay rate limiting activo
- [ ] ✅ Trigger de creación de perfiles funciona
- [ ] ✅ Logs muestran información detallada

## 🚀 **Resultado Esperado**

Después de implementar estas mejoras, deberías ver:
1. **Logs detallados** en la consola del navegador
2. **Mensajes de error específicos** en lugar de genéricos
3. **Registro exitoso** con emails nuevos
4. **Mejor experiencia de usuario** con validaciones claras

¡Con estos cambios podrás identificar exactamente qué está causando el problema! 🎯
