import { World } from './World';

async function main(selector: string) {
  const container = document.querySelector(selector);

  if (!container) {
    throw new Error(`Failed to find container: ${selector}`);
  }

  const world = new World(container);

  await world.load();
  world.start();
}

main('#three').catch((err) => {
  console.error(err);
});
