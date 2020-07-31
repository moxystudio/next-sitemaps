import urlJoin from 'proper-url-join';
import mem from 'mem';

const dynamicRouteSegmentRegExp = /^\[((?:\.\.\.)?[^\]]+)\]$/;

const mapRoute = async (route, mapDynamicRoute) => {
    const urlsSegments = [];
    const originalRouteSegments = route.split('/').slice(1);
    const stack = [
        {
            routeSegments: originalRouteSegments,
            prevDynamicRouteSegmentValues: {},
            index: 0,
        },
    ];

    while (stack.length > 0) {
        const stackItem = stack.shift();
        const routeSegment = stackItem.routeSegments[stackItem.index];

        // Did we reached the final segment of this route?
        // If so, its a URL with all its segments resolved.
        if (!routeSegment) {
            urlsSegments.push(stackItem.routeSegments);
            continue;
        }

        const dynamicRouteSegmentName = routeSegment.match(dynamicRouteSegmentRegExp)?.[1];

        // If the current segment is not dynamic, simply
        // advance the cursor into the next segment.
        if (!dynamicRouteSegmentName) {
            stack.push({
                ...stackItem,
                index: stackItem.index + 1,
            });
            continue;
        }

        const dynamicRoute = `/${originalRouteSegments.slice(0, stackItem.index + 1).join('/')}`;
        // eslint-disable-next-line no-await-in-loop
        const dynamicRouteSegmentValues = await mapDynamicRoute(dynamicRoute, stackItem.prevDynamicRouteSegmentValues);

        dynamicRouteSegmentValues.forEach((value) => {
            stack.push({
                ...stackItem,
                routeSegments: [
                    ...stackItem.routeSegments.slice(0, stackItem.index),
                    value,
                    ...stackItem.routeSegments.slice(stackItem.index + 1),
                ],
                index: stackItem.index + 1,
                prevDynamicRouteSegmentValues: {
                    ...stackItem.prevDynamicRouteSegmentValues,
                    [dynamicRouteSegmentName]: value,
                },
            });
        });
    }

    const urls = urlsSegments.map((segments) => urlJoin(...segments));

    return urls;
};

const mapRoutes = async (routes, options) => {
    const unmappedRoutes = new Set();

    const mapDynamicRoute = mem(
        (route, prevDynamicRouteMappings) => {
            const mapDynamicRoute = options.mapDynamicRoutes[route];

            if (mapDynamicRoute) {
                return mapDynamicRoute(prevDynamicRouteMappings) ?? [];
            }

            unmappedRoutes.add(route);

            return [];
        },
        {
            cacheKey: ([route, prevDynamicRouteMappings]) => `${route}.${JSON.stringify(prevDynamicRouteMappings)}`,
        },
    );

    const urls = [];

    for (const route of routes) {
        // eslint-disable-next-line no-await-in-loop
        const mappedUrls = await mapRoute(route, mapDynamicRoute);

        urls.push(...mappedUrls);
    }

    Array.from(unmappedRoutes.values())
        .sort()
        .forEach((route) => options.logWarning(`Unmapped dynamic route: ${route}`));

    return urls.sort();
};

export default mapRoutes;
