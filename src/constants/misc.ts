export const EMPTY_PAGINATED_RESPONSE = Object.freeze({ 
  data: [], 
  metadata: { 
    total: 0, 
    page: 1, 
    lastPage: 1, 
    hasNextPage: false, 
    hasPrevPage: false 
  }
});