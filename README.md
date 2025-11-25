# 📋 Guia Técnico - Aparatus

## 📖 Sobre o Projeto

**Aparatus** é uma aplicação web moderna de agendamento para barbearias, desenvolvida com Next.js 16 e TypeScript. O sistema oferece uma experiência completa para usuários agendarem serviços de barbearia, com integração de pagamentos via Stripe e um assistente virtual de agendamento baseado em IA (Google Gemini).

---

## 🛠️ Stack Tecnológica

### Core Framework
- **Next.js 16.0.1** - Framework React com App Router
- **React 19.2.0** - Biblioteca de interface do usuário
- **TypeScript 5** - Superset JavaScript com tipagem estática

### Banco de Dados & ORM
- **PostgreSQL** - Banco de dados relacional
- **Prisma 6.19.0** - ORM moderno para Node.js e TypeScript
- **Prisma Client** - Cliente de acesso ao banco de dados com type-safety

### Autenticação
- **Better Auth 1.3.34** - Sistema de autenticação completo
- **OAuth 2.0** - Integração com Google Sign-In
- Sessões gerenciadas com tokens seguros

### Pagamentos
- **Stripe 20.0.0** - Processamento de pagamentos
- **@stripe/stripe-js 7.8.0** - SDK do Stripe para o frontend
- Webhooks para confirmação de pagamentos

### Inteligência Artificial
- **AI SDK (@ai-sdk/google 2.0.28)** - SDK de IA da Vercel
- **Google Gemini 2.0 Flash** - Modelo de linguagem para chat
- **Streamdown 1.3.0** - Streaming de respostas de IA

### UI/UX
- **Tailwind CSS 4** - Framework CSS utility-first
- **Radix UI** - Componentes acessíveis e não estilizados
  - Alert Dialog, Avatar, Dialog, Separator, Slot
- **shadcn/ui** - Coleção de componentes reutilizáveis
- **Lucide React 0.553.0** - Biblioteca de ícones
- **React Day Picker 9.11.1** - Seletor de datas
- **Sonner 2.0.7** - Notificações toast
- **class-variance-authority** - Gerenciamento de variantes de classes CSS

### Validação & Type Safety
- **Zod 4.1.12** - Validação de schemas TypeScript-first
- **Next Safe Action 8.0.11** - Ações server-side type-safe

### Gerenciamento de Estado
- **TanStack Query (React Query) 5.90.7** - Gerenciamento de estado assíncrono
- Server Components para estado do servidor

### Utilidades
- **date-fns 4.1.0** - Manipulação e formatação de datas
- **clsx 2.1.1** - Utilitário para construção condicional de classes
- **tailwind-merge 3.4.0** - Merge inteligente de classes Tailwind

### DevOps & Ferramentas
- **ESLint 9** - Linter para JavaScript/TypeScript
- **Prettier 3.6.2** - Formatador de código
- **tsx 4.20.6** - Executor TypeScript para Node.js
- **dotenv 17.2.3** - Gerenciamento de variáveis de ambiente

---

## 🗄️ Modelagem de Dados

### Arquitetura do Banco de Dados

O projeto utiliza **PostgreSQL** como banco de dados principal, com **Prisma** como ORM. A modelagem foi projetada para suportar um sistema completo de agendamento com autenticação e pagamentos.

#### Diagrama Relacional

```
User (1) ─────< (N) Booking
User (1) ─────< (N) Session
User (1) ─────< (N) Account

Barbershop (1) ─────< (N) BarbershopService
Barbershop (1) ─────< (N) Booking

BarbershopService (1) ─────< (N) Booking
```

### Models do Prisma

#### 1. **User** (Usuário)
Armazena informações dos usuários da plataforma.

```prisma
model User {
  id            String    @id
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relações
  sessions      Session[]
  accounts      Account[]
  bookings      Booking[]
}
```

**Campos principais:**
- `id`: Identificador único gerado pelo Better Auth
- `email`: Email único do usuário
- `emailVerified`: Flag de verificação de email
- `image`: URL da foto de perfil (OAuth)

#### 2. **Session** (Sessão)
Gerencia sessões ativas dos usuários.

```prisma
model Session {
  id        String   @id
  expiresAt DateTime
  token     String   @unique
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(...)
}
```

**Características:**
- Token único por sessão
- Rastreamento de IP e User Agent
- Expiração automática de sessões

#### 3. **Account** (Conta OAuth)
Armazena credenciais de provedores OAuth.

```prisma
model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
}
```

**Provedores suportados:**
- Google OAuth 2.0

#### 4. **Barbershop** (Barbearia)
Cadastro das barbearias parceiras.

```prisma
model Barbershop {
  id          String   @id @default(uuid())
  name        String
  address     String
  description String
  imageUrl    String
  phones      String[]
  
  // Relações
  services    BarbershopService[]
  bookings    Booking[]
}
```

**Características:**
- Suporte a múltiplos telefones (array)
- Imagem de capa da barbearia
- Descrição detalhada

#### 5. **BarbershopService** (Serviço)
Serviços oferecidos por cada barbearia.

```prisma
model BarbershopService {
  id           String     @id @default(uuid())
  name         String
  description  String
  imageUrl     String
  priceInCents Int
  barbershopId String
  barbershop   Barbershop @relation(...)
  bookings     Booking[]
}
```

**Características:**
- Preço em centavos (previne erros de arredondamento)
- Cada serviço tem imagem própria
- Vinculado a uma barbearia específica

#### 6. **Booking** (Agendamento)
Registros de agendamentos realizados.

```prisma
model Booking {
  id             String    @id @default(uuid())
  userId         String
  serviceId      String
  barbershopId   String
  date           DateTime  @db.Timestamptz
  cancelled      Boolean?  @default(false)
  cancelledAt    DateTime? @db.Timestamptz
  stripeChargeId String?
  
  // Relações
  user         User              @relation(...)
  service      BarbershopService @relation(...)
  barbershop   Barbershop        @relation(...)
}
```

**Características:**
- Timestamp com timezone (UTC)
- Sistema de cancelamento com data de cancelamento
- Integração com Stripe (ID da cobrança)
- Validação de horário único por barbearia

#### 7. **Verification** (Verificação)
Tokens de verificação de email e recuperação de senha.

```prisma
model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

---

## 🏗️ Arquitetura da Aplicação

### Estrutura de Pastas

O projeto segue a arquitetura do **Next.js App Router** com organização modular:

```
aparatus/
├── app/                          # App Router do Next.js
│   ├── _actions/                 # Server Actions
│   │   ├── cancel-booking.ts
│   │   ├── create-booking.ts
│   │   ├── create-booking-checkout-session.ts
│   │   └── get-date-available-time-slots.ts
│   ├── _components/              # Componentes React
│   │   ├── ui/                   # Componentes shadcn/ui
│   │   ├── barbershop-item.tsx
│   │   ├── booking-item.tsx
│   │   ├── booking-sheet.tsx
│   │   └── ...
│   ├── _providers/               # Context Providers
│   │   └── query-provider.tsx
│   ├── api/                      # API Routes
│   │   ├── auth/[...all]/
│   │   ├── chat/
│   │   └── stripe/webhook/
│   ├── barbershops/              # Páginas de barbearias
│   ├── bookings/                 # Páginas de agendamentos
│   ├── chat/                     # Interface de chat com IA
│   └── generated/                # Prisma Client gerado
├── lib/                          # Bibliotecas e utilitários
│   ├── auth.ts                   # Configuração Better Auth
│   ├── prisma.ts                 # Instância Prisma Client
│   ├── action-client.ts          # Cliente de Server Actions
│   └── utils.ts                  # Funções utilitárias
├── prisma/                       # Configuração Prisma
│   ├── schema.prisma             # Schema do banco de dados
│   └── seed.ts                   # Dados iniciais
├── prompts/                      # Prompts do assistente IA
└── public/                       # Arquivos estáticos
```

### Padrões Arquiteturais

#### 1. **Server Components (Padrão)**
Por padrão, todos os componentes são Server Components, renderizados no servidor.

```tsx
// app/barbershops/page.tsx
export default async function BarbershopsPage() {
  const barbershops = await prisma.barbershop.findMany();
  return <div>...</div>;
}
```

**Vantagens:**
- Zero JavaScript enviado ao cliente por padrão
- Acesso direto ao banco de dados
- SEO otimizado

#### 2. **Client Components**
Usados apenas quando necessário (interatividade, hooks, eventos).

```tsx
'use client'
import { useState } from 'react';

export function BookingSheet() {
  const [isOpen, setIsOpen] = useState(false);
  // ...
}
```

#### 3. **Server Actions**
Funções assíncronas executadas no servidor, chamadas do cliente.

```tsx
// app/_actions/create-booking.ts
'use server'

export const createBooking = actionClient
  .inputSchema(z.object({
    serviceId: z.uuid(),
    date: z.date(),
  }))
  .action(async ({ parsedInput }) => {
    // Lógica no servidor
    const booking = await prisma.booking.create({...});
    return booking;
  });
```

**Benefícios:**
- Type-safety completo (input e output)
- Validação com Zod
- Tratamento de erros estruturado
- Sem necessidade de criar API routes

#### 4. **API Routes**
Utilizadas para webhooks e integrações externas.

```tsx
// app/api/stripe/webhook/route.ts
export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature');
  const event = stripe.webhooks.constructEvent(body, sig, secret);
  // Processar evento
}
```

---

## 🔐 Sistema de Autenticação

### Better Auth

Implementação completa com **Better Auth**, oferecendo:

#### Configuração

```typescript
// lib/auth.ts
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }
  }
});
```

#### Cliente de Autenticação

```typescript
// lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
});

export const { signIn, signOut, useSession } = authClient;
```

### Proteção de Rotas

```typescript
// Em Server Actions
const session = await auth.api.getSession({
  headers: await headers(),
});

if (!session?.user) {
  throw new Error("Unauthorized");
}
```

### Fluxo de Autenticação

1. **Sign In**: Usuário clica em "Login com Google"
2. **OAuth**: Redirecionamento para Google
3. **Callback**: Google retorna para `/api/auth/callback/google`
4. **Sessão**: Better Auth cria sessão e armazena no banco
5. **Token**: Cookie seguro com token de sessão
6. **Acesso**: Usuário autenticado pode acessar recursos protegidos

---

## 💳 Integração com Stripe

### Fluxo de Pagamento

#### 1. Criação da Checkout Session

```typescript
// app/_actions/create-booking-checkout-session.ts
export const createBookingCheckoutSession = actionClient
  .inputSchema(createBookingCheckoutSessionSchema)
  .action(async ({ parsedInput }) => {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/bookings`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/barbershops/${barbershopId}`,
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: service.name,
            description: service.description,
          },
          unit_amount: service.priceInCents,
        },
        quantity: 1,
      }],
      metadata: {
        userId: user.id,
        serviceId,
        barbershopId,
        date: date.toISOString(),
      },
    });
    
    return { sessionId: session.id };
  });
```

#### 2. Processamento do Webhook

```typescript
// app/api/stripe/webhook/route.ts
export async function POST(request: Request) {
  const event = stripe.webhooks.constructEvent(
    body, signature, webhookSecret
  );
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata;
    
    // Criar agendamento após pagamento confirmado
    await prisma.booking.create({
      data: {
        userId: metadata.userId,
        serviceId: metadata.serviceId,
        barbershopId: metadata.barbershopId,
        date: new Date(metadata.date),
        stripeChargeId: session.payment_intent,
      },
    });
  }
}
```

### Segurança

- **Webhook Signature Verification**: Todas as requisições são verificadas
- **Metadata**: Informações sensíveis nunca vão para o frontend
- **Idempotência**: Webhooks podem ser processados múltiplas vezes sem duplicar

---

## 🤖 Assistente Virtual com IA

### Google Gemini Integration

O projeto implementa um assistente de agendamento inteligente usando **Google Gemini 2.0 Flash** através do AI SDK da Vercel.

#### Configuração

```typescript
// app/api/chat/route.ts
import { streamText, tool } from "ai";
import { google } from "@ai-sdk/google";

export const POST = async (request: Request) => {
  const { messages } = await request.json();
  
  const result = streamText({
    model: google("gemini-2.0-flash"),
    system: `Você é o Agenda.ai, um assistente virtual...`,
    messages: convertToModelMessages(messages),
    tools: {
      searchBarbershops: tool({
        description: "Buscar barbearias por nome ou listar todas",
        parameters: z.object({
          name: z.string().optional(),
        }),
        execute: async ({ name }) => {
          return await prisma.barbershop.findMany({
            where: name ? { name: { contains: name } } : undefined,
            include: { services: true },
          });
        },
      }),
      getAvailableTimeSlotsForBarbershop: tool({
        description: "Verificar horários disponíveis",
        parameters: z.object({
          barbershopId: z.string(),
          date: z.string(),
        }),
        execute: async ({ barbershopId, date }) => {
          return await getAvailableTimeSlots({ barbershopId, date });
        },
      }),
      createBookingCheckoutSession: tool({
        description: "Criar sessão de pagamento",
        parameters: z.object({
          serviceId: z.string(),
          barbershopId: z.string(),
          date: z.string(),
        }),
        execute: async (params) => {
          const session = await createBookingCheckoutSession(params);
          return {
            checkoutUrl: session.url,
            message: "Pagamento criado com sucesso!",
          };
        },
      }),
    },
  });
  
  return result.toDataStreamResponse();
};
```

### Function Calling (Tools)

O assistente tem acesso a 3 ferramentas principais:

1. **searchBarbershops**: Busca barbearias por nome ou lista todas
2. **getAvailableTimeSlotsForBarbershop**: Verifica horários disponíveis
3. **createBookingCheckoutSession**: Cria sessão de pagamento no Stripe

### Fluxo de Conversação

```
Usuário: "Quero cortar o cabelo amanhã"
   ↓
IA: [chama searchBarbershops()]
   ↓
IA: [chama getAvailableTimeSlotsForBarbershop() para cada barbearia]
   ↓
IA: "Encontrei 3 barbearias com horários disponíveis..."
   ↓
Usuário: "Quero na Barbearia X às 14h"
   ↓
IA: [chama createBookingCheckoutSession()]
   ↓
IA: "Seu agendamento está quase pronto! Complete o pagamento..."
```

### Streaming de Respostas

```tsx
// app/chat/_components/chat-message.tsx
'use client'
import { useChat } from '@ai-sdk/react';

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
  });
  
  return (
    <div>
      {messages.map(message => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </div>
  );
}
```

**Benefícios:**
- Respostas em tempo real (streaming)
- Experiência mais natural e fluida
- Menor tempo de espera percebido

---

## 🎨 Sistema de Design e Componentes

### Shadcn/ui + Radix UI

O projeto utiliza **shadcn/ui**, uma coleção de componentes reutilizáveis construídos com **Radix UI** e **Tailwind CSS**.

#### Filosofia

- **Copy-Paste**: Componentes são copiados para o projeto (não são dependências)
- **Customizáveis**: Total controle sobre o código
- **Acessíveis**: Baseados em Radix UI (WAI-ARIA compliant)
- **Composable**: Componentes podem ser combinados

#### Componentes Principais

##### 1. **Button**
```tsx
// app/_components/ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary/90",
        outline: "border border-input hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export function Button({ variant, size, ...props }: ButtonProps) {
  return (
    <button className={buttonVariants({ variant, size })} {...props} />
  );
}
```

**Uso:**
```tsx
<Button variant="outline" size="lg">Click me</Button>
```

##### 2. **Sheet** (Side Panel)
```tsx
// Usado para sidebar de agendamento
<Sheet>
  <SheetTrigger asChild>
    <Button>Agendar</Button>
  </SheetTrigger>
  <SheetContent>
    <BookingForm />
  </SheetContent>
</Sheet>
```

##### 3. **Calendar** (Seletor de Data)
```tsx
// Integrado com React Day Picker
<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  disabled={(date) => date < new Date()}
  locale={ptBR}
/>
```

##### 4. **Alert Dialog** (Confirmação de Cancelamento)
```tsx
<AlertDialog>
  <AlertDialogTrigger>Cancelar</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
    <AlertDialogDescription>
      Esta ação não pode ser desfeita.
    </AlertDialogDescription>
    <AlertDialogAction onClick={handleCancel}>
      Confirmar
    </AlertDialogAction>
  </AlertDialogContent>
</AlertDialog>
```

### Tailwind CSS 4

#### Configuração

```typescript
// tailwind.config.ts
export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ...
      },
    },
  },
};
```

#### Design Tokens (CSS Variables)

```css
/* app/globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 262.1 83.3% 57.8%;
    --primary-foreground: 210 40% 98%;
    /* ... */
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... */
  }
}
```

**Benefícios:**
- Tema claro/escuro automático
- Consistência visual
- Fácil customização

---

## 📦 Componentização

### Estrutura de Componentes

#### 1. **Componentes de Apresentação**

```tsx
// app/_components/barbershop-item.tsx
interface BarberShopItemProps {
  barbershop: Barbershop;
}

export default function BarberShopItem({ barbershop }: BarberShopItemProps) {
  return (
    <Link href={`/barbershops/${barbershop.id}`}>
      <Image src={barbershop.imageUrl} alt={barbershop.name} />
      <h3>{barbershop.name}</h3>
      <p>{barbershop.address}</p>
    </Link>
  );
}
```

**Características:**
- Recebem dados via props
- Não têm lógica de negócio
- Reutilizáveis
- Focados em UI

#### 2. **Componentes Inteligentes (Containers)**

```tsx
// app/bookings/page.tsx
export default async function BookingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: { service: true, barbershop: true },
  });
  
  return <BookingsList bookings={bookings} />;
}
```

**Características:**
- Buscam dados
- Contêm lógica de negócio
- Orquestram componentes de apresentação

#### 3. **Componentes Compostos**

```tsx
// app/_components/booking-sheet.tsx
export function BookingSheet({ service, barbershop }: Props) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Agendar</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{service.name}</SheetTitle>
        </SheetHeader>
        <Calendar />
        <TimeSlotSelector />
        <BookingConfirmation />
      </SheetContent>
    </Sheet>
  );
}
```

**Características:**
- Combinam múltiplos componentes
- Gerenciam estado local
- Implementam fluxos completos

---

## 🔄 Gerenciamento de Estado

### Server State (TanStack Query)

```tsx
// app/_providers/query-provider.tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minuto
        refetchOnWindowFocus: false,
      },
    },
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

#### Uso em Componentes

```tsx
'use client'
import { useQuery, useMutation } from '@tanstack/react-query';

export function BookingsList() {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const response = await fetch('/api/bookings');
      return response.json();
    },
  });
  
  const cancelBooking = useMutation({
    mutationFn: (id: string) => cancelBookingAction({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
```

**Benefícios:**
- Cache automático
- Refetch inteligente
- Loading e error states
- Otimistic updates

### Client State (React Hooks)

Para estado local simples:

```tsx
'use client'
import { useState } from 'react';

export function BookingSheet() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  
  // ...
}
```

---

## 🚀 Performance e Otimizações

### 1. **Image Optimization**

```tsx
import Image from 'next/image';

<Image
  src={barbershop.imageUrl}
  alt={barbershop.name}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

**Benefícios:**
- Lazy loading automático
- Formatos modernos (WebP, AVIF)
- Responsive images
- Blur placeholder

### 2. **Server Components (Padrão)**

```tsx
// Componente renderizado no servidor
export default async function Page() {
  const data = await prisma.barbershop.findMany();
  return <List data={data} />;
}
```

**Benefícios:**
- Zero JavaScript no cliente
- Streaming HTML
- Melhor SEO
- Menor bundle size

### 3. **Suspense Boundaries**

```tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <BarbershopsList />
    </Suspense>
  );
}
```

### 4. **Dynamic Imports**

```tsx
import dynamic from 'next/dynamic';

const BookingSheet = dynamic(() => import('@/components/booking-sheet'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

---

## 🧪 Validação e Type Safety

### Zod Schemas

```typescript
// app/_actions/create-booking.ts
const inputSchema = z.object({
  serviceId: z.uuid("ID do serviço inválido"),
  date: z.date("Data inválida"),
});

type CreateBookingInput = z.infer<typeof inputSchema>;
```

### Next Safe Action

```typescript
export const createBooking = actionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput }) => {
    // parsedInput é type-safe e validado
    const booking = await prisma.booking.create({
      data: parsedInput,
    });
    return booking;
  });
```

**Benefícios:**
- Validação automática
- Type safety end-to-end
- Erros estruturados
- Melhor DX (Developer Experience)

---

## 📱 Responsividade

### Mobile-First Approach

```tsx
<div className="
  flex flex-col gap-4           // Mobile
  md:flex-row md:gap-6          // Tablet
  lg:gap-8                      // Desktop
">
  {/* Conteúdo */}
</div>
```

### Breakpoints Tailwind

```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

---

## 🔧 Variáveis de Ambiente

```env
# Database
DATABASE_URL="postgresql://..."

# Better Auth
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="..."

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="exemplo_..."

# Google AI
GOOGLE_GENERATIVE_AI_API_KEY="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 📋 Scripts Disponíveis

```json
{
  "dev": "next dev",
  "build": "prisma generate && next build",
  "start": "next start",
  "lint": "eslint",
  "prepare": "prisma generate",
  "postinstall": "prisma generate"
}
```

### Comandos Prisma

```bash
# Gerar Prisma Client
npx prisma generate

# Criar migration
npx prisma migrate dev --name init

# Aplicar migrations (produção)
npx prisma migrate deploy

# Abrir Prisma Studio
npx prisma studio

# Seed do banco
npx prisma db seed
```

---

## 🎯 Fluxo Completo de Agendamento

### Passo a Passo

1. **Descoberta**: Usuário navega ou usa chat para encontrar barbearias
2. **Seleção**: Escolhe uma barbearia e visualiza serviços
3. **Data e Hora**: Seleciona data e horário disponível
4. **Autenticação**: Login com Google (se necessário)
5. **Pagamento**: Redirecionado para Stripe Checkout
6. **Confirmação**: Webhook do Stripe confirma pagamento
7. **Agendamento**: Booking é criado no banco de dados
8. **Visualização**: Usuário vê agendamento em "Meus Agendamentos"

### Diagrama de Sequência

```
Usuário → Frontend → Server Action → Stripe → Webhook → Database
   |         |            |             |        |          |
   ├─ Escolhe serviço    |             |        |          |
   |         ├─ Valida disponibilidade |        |          |
   |         |            ├─ Cria checkout session         |
   |         |            |             ├─ Processa pagamento
   |         |            |             |        ├─ Notifica
   |         |            |             |        |    ├─ Cria booking
   |         ├─ Recebe confirmação ←──────────────────────┘
```

---

## 🛡️ Segurança

### Implementações

1. **Autenticação JWT** (Better Auth)
2. **CSRF Protection** (Next.js automático)
3. **Stripe Webhook Signature Verification**
4. **Server-side Validation** (Zod em todas as actions)
5. **Sanitização de Inputs**
6. **Rate Limiting** (recomendado para produção)
7. **HTTPS Only** (produção)
8. **Secure Cookies** (httpOnly, secure, sameSite)

---

## 📈 Possíveis Melhorias Futuras

### Backend
- [ ] Rate limiting com Upstash Redis
- [ ] Cache distribuído
- [ ] Background jobs (cancelamento automático após X horas sem pagamento)
- [ ] Logging estruturado (Winston, Pino)
- [ ] Monitoramento (Sentry, DataDog)

### Frontend
- [ ] PWA (Progressive Web App)
- [ ] Notificações push
- [ ] Modo offline
- [ ] Internacionalização (i18n)
- [ ] Testes E2E (Playwright)
- [ ] Testes unitários (Vitest)

### Features
- [ ] Sistema de avaliações
- [ ] Cashback/pontos de fidelidade
- [ ] Agendamento recorrente
- [ ] Notificações por email/SMS
- [ ] Painel administrativo para barbearias
- [ ] Relatórios e analytics

---

## 🤝 Contribuindo

### Setup Local

```bash
# Clone o repositório
git clone https://github.com/cerqMateus/aparatus.git

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Execute as migrations
npx prisma migrate dev

# Popule o banco de dados
npx prisma db seed

# Inicie o servidor de desenvolvimento
npm run dev
```

### Convenções de Código

- **TypeScript**: Sempre tipar explicitamente quando o tipo não é inferido
- **Prettier**: Formatação automática
- **ESLint**: Linting configurado
- **Commits**: Mensagens descritivas em português

---


## 👤 Autor

**Mateus Cerqueira**
- GitHub: [@cerqMateus](https://github.com/cerqMateus)

---

**Última atualização:** Novembro 2025
