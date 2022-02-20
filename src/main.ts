import { Stage } from './Stage';
import { init } from '@dimforge/rapier3d-compat';

async function main(selector: string) {
  await init();
  const container = document.querySelector(selector);

  if (!container) {
    throw new Error(`Failed to find container: ${selector}`);
  }

  const stage = new Stage(container);

  await stage.load();
  stage.start();
}

main('#three').catch((err) => {
  console.error(err);
  alert(err);
});
