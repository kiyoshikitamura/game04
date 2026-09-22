import './creative.css';

export default function TerritoryItemIcon({ itemId = 'raid_unlock' }: { itemId?: string }) {
  return itemId === 'raid_unlock' ? <img className="g4-growth-item-icon" src="/creative/items/territory-invasion-ticket.png" alt="" style={{ verticalAlign: 'middle' }} /> : null;
}
