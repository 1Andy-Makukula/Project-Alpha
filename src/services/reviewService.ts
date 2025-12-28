
export interface Review {
    id: string;
    productId: number;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
}

export const reviewService = {
    addReview: async (review: Omit<Review, 'id' | 'date'>) => {
        const newReview = {
            ...review,
            id: Math.random().toString(36).substring(7),
            date: new Date().toISOString()
        };
        console.log("Adding review:", newReview);
        // await db.reviews.add(newReview);
        return newReview;
    },

    getProductReviews: async (productId: number): Promise<Review[]> => {
        // await db.reviews.getByProduct(productId);
        return [];
    }
};
