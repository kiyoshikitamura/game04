export let game: any = {};
export function setGame(value: any) { game = { playCyberSe() {}, ...value }; }
export let rpc: any = async () => ({ data: [], error: null });
export function setRpc(value: any) { rpc = value; }
