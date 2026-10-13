// Infraestructura de Tecla Quest en Railway (Infrastructure as Code).
// Previsualizar: npx railway config plan    Aplicar: npx railway config apply
// La contraseña NO va aquí: se pone en Railway (preserve() conserva el valor que ya tenga).
import { defineRailway, github, preserve, project, service } from "railway/iac";

export default defineRailway(() => {
  const web = service("tecla-quest", {
    source: github("vladytc/typing-game", { branch: "main" }),
    start: "node server.js",
    healthcheck: "/health",
    healthcheckTimeout: 30,
    // Una sola réplica: los intentos fallidos y los bloqueos viven en la memoria del servidor.
    replicas: 1,
    deploy: {
      restartPolicyType: "ON_FAILURE",
      restartPolicyMaxRetries: 5,
      // Se duerme si nadie juega (ahorra); despierta sola con la siguiente visita.
      sleepApplication: true,
    },
    env: {
      APP_PASSWORD: preserve(),
      MAX_ATTEMPTS: "5",
      LOCKOUT_MINUTES: "15",
      GLOBAL_MAX_ATTEMPTS: "20",
      SESSION_DAYS: "30",
    },
  });

  return project("tecla-quest", { resources: [web] });
});
