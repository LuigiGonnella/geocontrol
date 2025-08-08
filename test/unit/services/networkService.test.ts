const mockGetAllNetworks = jest.fn();
const mockGetNetworkByNetworkCode = jest.fn();
const mockCreateNetwork = jest.fn();
const mockUpdateNetwork = jest.fn();
const mockDeleteNetwork = jest.fn();

jest.mock('@repositories/NetworkRepository', () => {
  return {
    NetworkRepository: jest.fn().mockImplementation(() => ({
      getAllNetworks: mockGetAllNetworks,
      getNetworkByNetworkCode: mockGetNetworkByNetworkCode,
      createNetwork: mockCreateNetwork,
      updateNetwork: mockUpdateNetwork,
      deleteNetwork: mockDeleteNetwork,
    })),
  };
});

import * as networkService from '@services/networkService';
import { Network as NetworkDTO } from '@dto/Network';

describe('networkService (no spy)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get all networks', async () => {
    const mockNetworks: NetworkDTO[] = [{ code: 'NET001', name: 'Network', description: 'Test network' }];
    mockGetAllNetworks.mockResolvedValue(mockNetworks);

    const result = await networkService.getAllNetworks();

    expect(mockGetAllNetworks).toHaveBeenCalled();
    expect(result).toEqual(mockNetworks);
  });

  it('should get network by code', async () => {
    const mockNetwork: NetworkDTO = { code: 'NET001', name: 'Network', description: 'Test Network' };
    mockGetNetworkByNetworkCode.mockResolvedValue(mockNetwork);

    const result = await networkService.getNetworkByCode('NET001');

    expect(mockGetNetworkByNetworkCode).toHaveBeenCalledWith('NET001');
    expect(result).toEqual(mockNetwork);
  });

  it('should create a network', async () => {
    mockCreateNetwork.mockResolvedValue(undefined);

    await networkService.createNetwork({ code: 'NET002', name: 'New', description: 'New network' });

    expect(mockCreateNetwork).toHaveBeenCalledWith('NET002', 'New', 'New network');
  });

  it('should update a network', async () => {
    mockUpdateNetwork.mockResolvedValue(undefined);

    await networkService.updateNetwork('NET001', {
      code: 'NET002',
      name: 'Updated',
      description: 'Updated network',
    });

    expect(mockUpdateNetwork).toHaveBeenCalledWith('NET001', 'NET002', 'Updated', 'Updated network');
  });

  it('should delete a network', async () => {
    mockDeleteNetwork.mockResolvedValue(undefined);

    await networkService.deleteNetwork('NET001');

    expect(mockDeleteNetwork).toHaveBeenCalledWith('NET001');
  });
});
