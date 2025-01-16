import * as React from "react"
import { User, Brain, Rocket, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface LoadingStates {
  perplexity: boolean
  rocketReach: boolean
  openai: boolean
}

interface StepProps {
  icon: React.ReactNode
  label: string
  isActive: boolean
  isDone: boolean
  isLast?: boolean
  index: number
}

function Step({ icon, label, isActive, isDone, isLast, index }: StepProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className="relative flex flex-col items-center"
    >
      {/* Progress indicator */}
      {!isLast && (
        <motion.div 
          className="absolute top-[22px] left-[calc(50%+35px)] h-[2px] w-[130px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.15 + 0.1 }}
        >
          <motion.div
            className="h-full origin-left bg-primary/20"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isDone ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </motion.div>
      )}

      {/* Icon Container */}
      <motion.div
        className={cn(
          "relative w-11 h-11 rounded-2xl flex items-center justify-center",
          "transition-all duration-300 ease-out",
          isActive ? "bg-primary shadow-lg shadow-primary/25" : 
          isDone ? "bg-primary/90" : 
          "bg-muted"
        )}
        animate={{
          scale: isActive ? 1.05 : 1,
        }}
      >
        {/* Background glow effect */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        
        <motion.div
          className={cn(
            "relative z-10",
            isActive || isDone ? "text-primary-foreground" : "text-muted-foreground"
          )}
        >
          {icon}
        </motion.div>
      </motion.div>

      {/* Label */}
      <motion.div 
        className="mt-3 text-center"
        animate={{
          opacity: isActive ? 1 : 0.7
        }}
      >
        <p className={cn(
          "text-sm font-medium",
          isActive ? "text-primary" : "text-muted-foreground"
        )}>
          {label}
        </p>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 flex items-center gap-1.5"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs text-primary">Processing</span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

export function LoadingIndicator({ loadingStates }: { loadingStates: LoadingStates }) {
  const isDone = (step: keyof LoadingStates) => {
    const steps: (keyof LoadingStates)[] = ['perplexity', 'rocketReach', 'openai']
    const currentIndex = steps.indexOf(step)
    const activeIndex = steps.findIndex(s => loadingStates[s])
    return currentIndex < activeIndex
  }

  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-start px-4">
          <Step
            icon={<User size={20} />}
            label="Profile"
            isActive={false}
            isDone={false}
            index={0}
          />
          <Step
            icon={<Brain size={20} />}
            label="Analysis"
            isActive={loadingStates.perplexity}
            isDone={isDone('perplexity')}
            index={1}
          />
          <Step
            icon={<Rocket size={20} />}
            label="History"
            isActive={loadingStates.rocketReach}
            isDone={isDone('rocketReach')}
            index={2}
          />
          <Step
            icon={<Sparkles size={20} />}
            label="Processing"
            isActive={loadingStates.openai}
            isDone={isDone('openai')}
            isLast
            index={3}
          />
        </div>
      </div>
    </div>
  )
} 