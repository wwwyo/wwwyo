import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

test('the blog links to the hobby archive and its project pages', async ({ app, agent, screen, browser }) => {
  await app.open('/');
  await expect(screen.getByRole('link', { name: "wwwyo's blog", exact: true })).toBeVisible();
  await agent.act('Open Hobby using the site navigation.');
  await expect(browser).toHaveURL('/hobby');
  await expect(screen.getByRole('heading', { name: 'Hobby', exact: true })).toBeVisible();
  await expect(screen.getByRole('link', { name: /skillctrl/ })).toBeVisible();
});
