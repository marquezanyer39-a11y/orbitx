import { getBrokerStatus, getBrokerUserStatus } from './okx-broker-service.js';
import { requestOkx } from './okx-http-client.js';
import { mapOkxAccountStatus, mapOkxBalances, mapOkxFee } from './okx-mappers.js';

export async function getAccountStatus(userId, env = process.env) {
  const brokerUser = await getBrokerUserStatus(userId, env);

  if (!brokerUser.linked) {
    return mapOkxAccountStatus({ linked: false }, userId);
  }

  const raw = await requestOkx({ path: '/api/v5/account/config', env });
  return mapOkxAccountStatus(raw, userId);
}

export async function getBalances(userId, env = process.env) {
  await getBrokerStatus(env);
  const raw = await requestOkx({ path: '/api/v5/account/balance', env });
  return mapOkxBalances(raw, `okx:${userId}`);
}

export async function getFees(_userId, env = process.env) {
  const raw = await requestOkx({ path: '/api/v5/account/trade-fee', env });
  const rows = Array.isArray(raw) ? raw : raw?.data;
  return (Array.isArray(rows) ? rows : []).map(mapOkxFee);
}
