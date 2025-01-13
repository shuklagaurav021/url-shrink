exports.paginate = (data, page = 1, limit = 10) => {
    const totalCount = data.length;
    const totalPages = Math.ceil(totalCount / limit);
    const offset = (page - 1) * limit;
    const paginatedData = data.slice(offset, offset + limit);
  
    return {
      data: paginatedData,
      pagination: {
        currentPage: page,
        limit,
        totalCount,
        totalPages,
      },
    };
  };
  