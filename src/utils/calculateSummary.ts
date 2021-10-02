export default function calculateSummay(ordersSummary: any) {
    console.log(ordersSummary)
    const restFlour = ordersSummary ? ordersSummary.totalFlour - ordersSummary.totalBreed : 0;
    const totalAccount = ordersSummary ? ordersSummary.totalBreed + ordersSummary.totalDebt : 0;
    const restAccount = ordersSummary ? totalAccount - ordersSummary.totalPayed : 0;
    return { restFlour, totalAccount, restAccount }
}