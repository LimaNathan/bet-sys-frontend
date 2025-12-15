'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/store/auth-store';
import { useOnboardingStore } from '@/store/onboarding-store';
import { ArrowLeft, ArrowRight, Gift, Sparkles, Star, Target, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

const onboardingSteps = [
  {
    icon: Sparkles,
    title: 'Bem-vindo ao Cotic Bet! 🎉',
    description: 'Seu novo sistema de apostas corporativo para diversão entre colegas. Vamos te mostrar como funciona!',
    color: 'text-primary',
    bgColor: 'bg-primary/20',
  },
  {
    icon: Gift,
    title: 'Bônus Diário 💰',
    description: 'Todo dia você pode resgatar R$ 100 de bônus na sua carteira. Não esqueça de resgatar!',
    color: 'text-green-500',
    bgColor: 'bg-green-500/20',
  },
  {
    icon: Trophy,
    title: 'Eventos e Apostas 🏆',
    description: 'Explore os eventos disponíveis e faça suas apostas. As odds são dinâmicas e mudam conforme as apostas!',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/20',
  },
  {
    icon: Target,
    title: 'Acompanhe seus Resultados 📊',
    description: 'Veja seu histórico de apostas, taxa de vitória e acompanhe quando seus eventos forem encerrados.',
    color: 'text-accent-foreground',
    bgColor: 'bg-accent-foreground/20',
  },
  {
    icon: Star,
    title: 'Tudo Pronto! ⭐',
    description: 'Agora você está pronto para começar! Boa sorte nas suas apostas e divirta-se!',
    color: 'text-primary',
    bgColor: 'bg-primary/20',
  },
];

export function OnboardingModal() {
  const { hasCompletedOnboarding, currentStep, setStep, setCompleted } = useOnboardingStore();
  const { isAuthenticated, user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    // Show onboarding for authenticated users who haven't completed it
    // Don't show for admins
    if (isAuthenticated && !hasCompletedOnboarding && !isAdmin) {
      // Small delay to ensure the app is fully loaded
      const timer = setTimeout(() => setOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, hasCompletedOnboarding, isAdmin]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCompleted();
    setOpen(false);
  };

  const handleSkip = () => {
    setCompleted();
    setOpen(false);
  };

  const step = onboardingSteps[currentStep];
  const StepIcon = step.icon;
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-strong sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className={`rounded-full p-4 ${step.bgColor} inline-block`}>
              <StepIcon className={`h-10 w-10 ${step.color}`} />
            </div>
          </div>
          <DialogTitle className="text-2xl">{step.title}</DialogTitle>
          <DialogDescription className="text-base pt-2">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 py-4">
          {onboardingSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setStep(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-6 bg-primary'
                  : index < currentStep
                  ? 'w-2 bg-primary/50'
                  : 'w-2 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            Pular
          </Button>
          <div className="flex gap-2 flex-1 justify-end">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrev}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
            )}
            <Button onClick={handleNext} className="glow-primary">
              {isLastStep ? (
                <>
                  Começar!
                  <Sparkles className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
