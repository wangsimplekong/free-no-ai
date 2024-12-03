export const useOrderStatus = (orderNo: string) => {
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const checkStatus = async () => {
      try {
        const response = await axios.get(`/api/orders/${orderNo}/status`);
        setStatus(response.data.status);
        
        if ([OrderStatus.PAID, OrderStatus.FAILED, OrderStatus.CANCELLED].includes(response.data.status)) {
          clearInterval(timer);
          if (response.data.status === OrderStatus.PAID) {
            await memberStore.refreshMemberStatus();
          }
        }
      } catch (error) {
        console.error('Check order status failed:', error);
      } finally {
        setLoading(false);
      }
    };

    timer = setInterval(checkStatus, 3000);
    return () => clearInterval(timer);
  }, [orderNo]);

  return { status, loading };
}; 