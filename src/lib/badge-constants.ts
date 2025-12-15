import { Award, Briefcase, DollarSign, LucideIcon, Skull, Sparkles } from 'lucide-react';

export interface BadgeInfo {
  code: string;
  title: string;
  description: string;
  category: string;
  reward: number;
  icon: LucideIcon;
  color: string;
}

export const BADGE_INFO: Record<string, BadgeInfo> = {
  // A Tragédia
  MICK_JAGGER: {
    code: 'MICK_JAGGER',
    title: 'Pé Frio Lendário',
    description: 'Se ele torcer pelo Brasil, a gente perde.',
    category: 'TRAGEDY',
    reward: 50,
    icon: Skull,
    color: 'text-red-500',
  },
  TITANIC: {
    code: 'TITANIC',
    title: 'Capitão do Naufrágio',
    description: 'Foi de arrasta pra cima em tempo recorde.',
    category: 'TRAGEDY',
    reward: 10,
    icon: Skull,
    color: 'text-blue-500',
  },
  VASCO: {
    code: 'VASCO',
    title: 'O Eterno Vice',
    description: 'Caiu, mas passa bem.',
    category: 'TRAGEDY',
    reward: 200,
    icon: Award,
    color: 'text-gray-500',
  },
  ROBIN_HOOD_REVERSO: {
    code: 'ROBIN_HOOD_REVERSO',
    title: 'Robin Hood Reverso',
    description: 'Tira dos pobres (você) e dá aos ricos.',
    category: 'TRAGEDY',
    reward: 5,
    icon: DollarSign,
    color: 'text-red-600',
  },

  // Gestão Duvidosa
  JULIUS: {
    code: 'JULIUS',
    title: 'O Pai do Chris',
    description: 'Se não comprar nada, o desconto é maior.',
    category: 'FINANCE',
    reward: 0.5,
    icon: DollarSign,
    color: 'text-green-500',
  },
  CLT_SOFRIDO: {
    code: 'CLT_SOFRIDO',
    title: 'Vale-Transporte',
    description: 'O salário cai dia 5 e acaba dia 6.',
    category: 'FINANCE',
    reward: 20,
    icon: Briefcase,
    color: 'text-orange-500',
  },
  PRIMO_RICO: {
    code: 'PRIMO_RICO',
    title: 'O Holder',
    description: 'O segredo é não vender (e não perder).',
    category: 'FINANCE',
    reward: 500,
    icon: DollarSign,
    color: 'text-emerald-500',
  },

  // Sorte e Caos
  MAE_DINAH: {
    code: 'MAE_DINAH',
    title: 'Vidente do Zap',
    description: 'As visões estão além da compreensão.',
    category: 'LUCK',
    reward: 1000,
    icon: Sparkles,
    color: 'text-purple-500',
  },
  INIMIGO_DO_FIM: {
    code: 'INIMIGO_DO_FIM',
    title: 'Emoção Pura',
    description: 'Deixa tudo para a última hora.',
    category: 'LUCK',
    reward: 20,
    icon: Sparkles,
    color: 'text-yellow-500',
  },
  ILUDIDO: {
    code: 'ILUDIDO',
    title: 'O Sonhador',
    description: 'Era só o Flamengo empatar...',
    category: 'LUCK',
    reward: 50,
    icon: Sparkles,
    color: 'text-pink-500',
  },

  // Corporativo
  PUXA_SACO: {
    code: 'PUXA_SACO',
    title: 'Funcionário do Mês',
    description: 'A promoção vem aí, confia.',
    category: 'CORPORATE',
    reward: 100,
    icon: Briefcase,
    color: 'text-blue-600',
  },
  REUNIAO_EMAIL: {
    code: 'REUNIAO_EMAIL',
    title: 'Ocioso Profissional',
    description: 'Trabalhar atrapalha as apostas.',
    category: 'CORPORATE',
    reward: 15,
    icon: Briefcase,
    color: 'text-slate-500',
  },

  // Platina
  DONO_DA_BANCA: {
    code: 'DONO_DA_BANCA',
    title: 'O DONO DA BANCA',
    description: 'Zerou o jogo. Lenda viva.',
    category: 'PLATINUM',
    reward: 5000,
    icon: Award,
    color: 'text-yellow-400',
  },
};

export const CATEGORY_LABELS: Record<string, string> = {
  TRAGEDY: 'A Tragédia',
  FINANCE: 'Gestão Duvidosa',
  LUCK: 'Sorte e Caos',
  CORPORATE: 'Corporativo',
  PLATINUM: 'Platina',
};
