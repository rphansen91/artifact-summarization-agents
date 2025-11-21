
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { weatherWorkflow } from './workflows/weather-workflow';
import { artifactAnalysisWorkflow } from './workflows/artifact-analysis-workflow';
import { autoArtifactAnalysisWorkflow } from './workflows/auto-artifact-workflow';
import { weatherAgent } from './agents/weather-agent';
import { artifactAgent } from './agents/artifact-agent';


export const mastra = new Mastra({
  workflows: { weatherWorkflow, artifactAnalysisWorkflow, autoArtifactAnalysisWorkflow },
  agents: { weatherAgent, artifactAgent },
  storage: new LibSQLStore({
    // stores observability, scores, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: "file:../../store/mastra.db",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  telemetry: {
    // Telemetry is deprecated and will be removed in the Nov 4th release
    enabled: false, 
  },
  observability: {
    // Enables DefaultExporter and CloudExporter for AI tracing
    default: { enabled: true }, 
  }
});
