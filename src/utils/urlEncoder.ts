import { MarketConfig } from '../types';
import protobuf from 'protobufjs';

let root: protobuf.Root | null = null;

async function loadProto() {
  if (root) return root;
  
  root = new protobuf.Root();
  
  // Define the protobuf schema inline
  root.define('market').add(
    new protobuf.Type('Outcome').add(
      new protobuf.Field('id', 1, 'string')
    ).add(
      new protobuf.Field('name', 2, 'string')
    ).add(
      new protobuf.Field('color', 3, 'string')
    ).add(
      new protobuf.Field('currentOdds', 4, 'int32')
    ).add(
      new protobuf.Field('customTrendData', 5, 'double', 'repeated')
    )
  );
  
  root.lookupTypeOrEnum('market').parent?.add(
    new protobuf.Type('MarketConfig').add(
      new protobuf.Field('title', 1, 'string')
    ).add(
      new protobuf.Field('image', 2, 'string')
    ).add(
      new protobuf.Field('marketType', 3, 'string')
    ).add(
      new protobuf.Field('currentOdds', 4, 'int32')
    ).add(
      new protobuf.Field('volume', 5, 'int32')
    ).add(
      new protobuf.Field('volatility', 6, 'double')
    ).add(
      new protobuf.Field('customTrendData', 7, 'double', 'repeated')
    ).add(
      new protobuf.Field('outcomes', 8, 'Outcome', 'repeated')
    ).add(
      new protobuf.Field('startDate', 9, 'int64')
    ).add(
      new protobuf.Field('endDate', 10, 'int64')
    )
  );
  
  return root;
}

export async function encodeConfigToUrl(config: MarketConfig): Promise<string> {
  try {
    const root = await loadProto();
    const MarketConfigType = root.lookupType('market.MarketConfig');
    
    // Convert config to protobuf-compatible format
    const protoConfig = {
      title: config.title,
      image: config.image || '',
      marketType: config.marketType,
      currentOdds: config.currentOdds,
      volume: config.volume,
      volatility: config.volatility,
      customTrendData: config.customTrendData || [],
      outcomes: config.outcomes.map(o => ({
        id: o.id,
        name: o.name,
        color: o.color,
        currentOdds: o.currentOdds,
        customTrendData: o.customTrendData || []
      })),
      startDate: config.startDate.getTime(),
      endDate: config.endDate.getTime()
    };
    
    const message = MarketConfigType.create(protoConfig);
    const buffer = MarketConfigType.encode(message).finish();
    
    // Convert to base64url (URL-safe base64)
    const base64 = btoa(String.fromCharCode(...buffer));
    const base64url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    
    return base64url;
  } catch (error) {
    console.error('Failed to encode config:', error);
    throw error;
  }
}

export async function decodeConfigFromUrl(encoded: string): Promise<Partial<MarketConfig>> {
  try {
    const root = await loadProto();
    const MarketConfigType = root.lookupType('market.MarketConfig');
    
    // Convert base64url back to base64
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    
    // Decode base64 to buffer
    const binaryString = atob(base64);
    const buffer = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      buffer[i] = binaryString.charCodeAt(i);
    }
    
    const message = MarketConfigType.decode(buffer);
    const obj: any = MarketConfigType.toObject(message);
    
    // Convert back to MarketConfig format
    return {
      title: obj.title,
      image: obj.image || null,
      marketType: obj.marketType,
      currentOdds: obj.currentOdds,
      volume: obj.volume,
      volatility: obj.volatility,
      customTrendData: obj.customTrendData?.length > 0 ? obj.customTrendData : null,
      outcomes: obj.outcomes.map((o: any) => ({
        id: o.id,
        name: o.name,
        color: o.color,
        currentOdds: o.currentOdds,
        customTrendData: o.customTrendData?.length > 0 ? o.customTrendData : null
      })),
      startDate: new Date(Number(obj.startDate)),
      endDate: new Date(Number(obj.endDate))
    };
  } catch (error) {
    console.error('Failed to decode config:', error);
    throw error;
  }
}

